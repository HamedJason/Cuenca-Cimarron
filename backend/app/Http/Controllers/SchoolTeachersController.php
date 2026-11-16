<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Support\Audit;
use App\Support\DeviceAuth;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// La escuela da de alta a sus docentes y les genera enlaces de acceso.
class SchoolTeachersController extends Controller
{
    public const INVITE_DAYS = 14;

    private function teacherOf(Request $request, Teacher $teacher): Teacher
    {
        abort_unless($teacher->school_id === $request->user()->school->id, 404);

        return $teacher;
    }

    private static function invite(Teacher $teacher): array
    {
        $token = bin2hex(random_bytes(24));
        DB::table('teacher_invites')->where('teacher_id', $teacher->id)->whereNull('used_at')->delete();
        DB::table('teacher_invites')->insert([
            'teacher_id' => $teacher->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(self::INVITE_DAYS),
            'created_at' => now(),
        ]);

        return ['link' => Settings::publicUrl().'/docente/acceso/'.$token, 'expires_at' => now()->addDays(self::INVITE_DAYS)->toIso8601String()];
    }

    public function index(Request $request): JsonResponse
    {
        $teachers = Teacher::where('school_id', $request->user()->school->id)
            ->withCount(['classrooms' => fn ($q) => $q->whereNull('archived_at')])
            ->orderByDesc('active')->orderBy('name')->get();
        $students = DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->whereIn('classrooms.teacher_id', $teachers->pluck('id'))
            ->whereNull('classrooms.archived_at')
            ->select('classrooms.teacher_id', DB::raw('count(*) as total'))
            ->groupBy('classrooms.teacher_id')->pluck('total', 'teacher_id');

        return response()->json(['teachers' => $teachers->map(fn (Teacher $t) => [
            'id' => $t->id,
            'name' => $t->name,
            'active' => $t->active,
            'classrooms' => $t->classrooms_count,
            'students' => (int) ($students[$t->id] ?? 0),
        ])]);
    }

    // Todos los grupos de la escuela, para que vea cómo va cada docente.
    public function classrooms(Request $request): JsonResponse
    {
        $classrooms = \App\Models\Classroom::whereIn('teacher_id', Teacher::where('school_id', $request->user()->school->id)->pluck('id'))
            ->with('teacher:id,name')->withCount('students')->whereNull('archived_at')->orderBy('grade')->orderBy('name')->get();

        return response()->json(['classrooms' => $classrooms->map(fn ($c) => TeacherController::classroomData($c) + ['teacher' => $c->teacher->name])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'min:3', 'max:80']]);
        $teacher = new Teacher(['name' => trim($data['name'])]);
        $teacher->school_id = $request->user()->school->id;
        $teacher->save();
        Audit::log('school', $request->user()->id, 'alta-docente', 'teacher', $teacher->id);

        return response()->json(['teacher' => ['id' => $teacher->id, 'name' => $teacher->name, 'active' => true, 'classrooms' => 0, 'students' => 0]] + self::invite($teacher), 201);
    }

    public function newLink(Request $request, Teacher $teacher): JsonResponse
    {
        $teacher = $this->teacherOf($request, $teacher);
        if (! $teacher->active) {
            return response()->json(['message' => 'Ese docente está dado de baja.'], 422);
        }
        Audit::log('school', $request->user()->id, 'enlace-docente', 'teacher', $teacher->id);

        return response()->json(self::invite($teacher));
    }

    public function deactivate(Request $request, Teacher $teacher): JsonResponse
    {
        $teacher = $this->teacherOf($request, $teacher);
        $teacher->active = false;
        $teacher->save();
        DB::table('teacher_invites')->where('teacher_id', $teacher->id)->whereNull('used_at')->delete();
        DeviceAuth::revokeAll('teacher', $teacher->id);
        Audit::log('school', $request->user()->id, 'baja-docente', 'teacher', $teacher->id);

        return response()->json(['ok' => true]);
    }

    public function reactivate(Request $request, Teacher $teacher): JsonResponse
    {
        $teacher = $this->teacherOf($request, $teacher);
        $teacher->active = true;
        $teacher->save();
        Audit::log('school', $request->user()->id, 'reactivar-docente', 'teacher', $teacher->id);

        return response()->json(self::invite($teacher));
    }

    // El docente abre su enlace: se canjea una sola vez y deja la cookie en su navegador.
    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'size:48']]);
        $invite = DB::transaction(function () use ($data) {
            $row = DB::table('teacher_invites')
                ->where('token_hash', hash('sha256', $data['token']))
                ->whereNull('used_at')->where('expires_at', '>', now())
                ->lockForUpdate()->first();
            if ($row) {
                DB::table('teacher_invites')->where('id', $row->id)->update(['used_at' => now()]);
            }

            return $row;
        });
        $teacher = $invite ? Teacher::with('school')->where('active', true)->find($invite->teacher_id) : null;
        if (! $teacher || ! $teacher->school->isApproved()) {
            return response()->json(['message' => 'Este enlace ya no sirve. Pide uno nuevo a tu escuela.'], 422);
        }
        Audit::log('teacher', $teacher->id, 'acceso-docente');

        return response()->json(['teacher' => TeacherController::summary($teacher)])
            ->withCookie(DeviceAuth::issue($request, 'teacher', $teacher->id));
    }
}
