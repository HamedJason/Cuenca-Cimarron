<?php

namespace App\Http\Controllers;

use App\Mail\Notice;
use App\Models\School;
use App\Models\Teacher;
use App\Support\AccountTokens;
use App\Support\Audit;
use App\Support\DemoMode;
use App\Support\Mailer;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Lo que hace la administración del sistema para ayudar a una escuela:
// ver sus docentes y grupos, mandar enlaces nuevos, cambiar su correo y suspenderla.
class SchoolAdminController extends Controller
{
    // La cuenta de demostración solo puede ver y cambiar escuelas demo.
    private static function guardDemo(Request $request, School $school): void
    {
        if (DemoMode::isDemoUser($request->user()) && ! DemoMode::isDemoSchool($school)) {
            abort(response()->json(['message' => 'La cuenta de demostración solo puede ver escuelas demo.'], 403));
        }
    }

    public function show(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        $teachers = Teacher::where('school_id', $school->id)->orderByDesc('active')->orderBy('name')->get();
        $classrooms = DB::table('classrooms')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->where('teachers.school_id', $school->id)
            ->select('classrooms.id', 'classrooms.name', 'classrooms.grade', 'classrooms.code', 'classrooms.open', 'classrooms.archived_at', 'teachers.name as teacher', 'teachers.id as teacher_id')
            ->orderByRaw('classrooms.archived_at is not null')->orderBy('classrooms.name')->get();
        $students = DB::table('students')->whereIn('classroom_id', $classrooms->pluck('id'))->whereNull('anonymized_at')
            ->select('classroom_id', DB::raw('count(*) as total'))->groupBy('classroom_id')->pluck('total', 'classroom_id');

        return response()->json([
            'school' => $school->toPublic() + [
                'email' => $school->user->email,
                'email_verified' => $school->user->email_verified_at !== null,
                'created_at' => $school->created_at?->toIso8601String(),
            ],
            'teachers' => $teachers->map(fn (Teacher $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'active' => $t->active,
                'classrooms' => $classrooms->where('teacher_id', $t->id)->whereNull('archived_at')->count(),
                'students' => $classrooms->where('teacher_id', $t->id)->sum(fn ($c) => (int) ($students[$c->id] ?? 0)),
            ]),
            'classrooms' => $classrooms->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'grade' => $c->grade,
                'code' => $c->code,
                'open' => (bool) $c->open,
                'archived' => $c->archived_at !== null,
                'teacher' => $c->teacher,
                'students' => (int) ($students[$c->id] ?? 0),
            ]),
        ]);
    }

    public function suspend(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:300']]);
        $school->status = 'suspended';
        $school->rejection_reason = $data['reason'];
        $school->reviewed_by = $request->user()->id;
        $school->reviewed_at = now();
        $school->save();
        Audit::log('admin', $request->user()->id, 'suspender-escuela', 'school', $school->id, ['motivo' => $data['reason']]);

        return response()->json(['school' => $school->toPublic()]);
    }

    public function reactivate(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        $school->status = 'approved';
        $school->rejection_reason = null;
        $school->reviewed_by = $request->user()->id;
        $school->reviewed_at = now();
        $school->save();
        Audit::log('admin', $request->user()->id, 'reactivar-escuela', 'school', $school->id);

        return response()->json(['school' => $school->toPublic()]);
    }

    // Enlace para que la escuela ponga una contraseña nueva. Se manda por correo y también se muestra.
    public function passwordLink(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        $user = $school->user;
        $token = AccountTokens::create($user, 'reset', 60 * 24);
        $link = Settings::publicUrl().'/escuelas/contrasena?token='.$token;
        $sent = Mailer::send($user->email, new Notice(
            'Nueva contraseña',
            ['La administración de Cuenca Cimarrona te mandó este enlace para poner una contraseña nueva.', 'Sirve 24 horas.'],
            'Poner contraseña nueva',
            $link,
        ));
        Audit::log('admin', $request->user()->id, 'enlace-contrasena-escuela', 'school', $school->id);

        return response()->json(['link' => $link, 'mail_sent' => $sent]);
    }

    public function changeEmail(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        AuthController::normalizeEmail($request);
        $data = $request->validate(['email' => ['required', 'email', 'max:160', 'unique:users,email,'.$school->user_id]]);
        $user = $school->user;
        $old = $user->email;
        $user->forceFill(['email' => $data['email'], 'email_verified_at' => now()])->save();
        DB::table('sessions')->where('user_id', $user->id)->delete();
        Audit::log('admin', $request->user()->id, 'cambiar-correo-escuela', 'school', $school->id, ['antes' => $old, 'ahora' => $data['email']]);

        return response()->json(['email' => $user->email]);
    }

    // Enlace nuevo para un docente que perdió el suyo.
    public function teacherLink(Request $request, Teacher $teacher): JsonResponse
    {
        self::guardDemo($request, $teacher->school);
        if (! $teacher->active) {
            return response()->json(['message' => 'Ese docente está dado de baja.'], 422);
        }
        Audit::log('admin', $request->user()->id, 'enlace-docente', 'teacher', $teacher->id);

        return response()->json(SchoolTeachersController::invite($teacher));
    }

    // Si la escuela perdió su contraseña y sus códigos, la administración le genera códigos nuevos
    // y se los da por otro medio. Los anteriores dejan de servir.
    public function recoveryCodes(Request $request, School $school): JsonResponse
    {
        self::guardDemo($request, $school);
        $codes = \App\Support\RecoveryCodes::generate($school->user);
        Audit::log('admin', $request->user()->id, 'codigos-escuela', 'school', $school->id);

        return response()->json(['recovery_codes' => $codes]);
    }
}
