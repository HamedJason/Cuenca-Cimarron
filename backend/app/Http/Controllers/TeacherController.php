<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\Audit;
use App\Support\DeviceAuth;
use App\Support\Settings;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

// Panel del docente: sus grupos y sus alumnos. Solo ve lo suyo.
class TeacherController extends Controller
{
    public static function summary(Teacher $teacher): array
    {
        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'school' => $teacher->school->name,
            'avatar' => \App\Support\Cimacoins::teacherAvatar($teacher->avatar),
        ];
    }

    private function teacher(Request $request): Teacher
    {
        return $request->attributes->get('teacher');
    }

    private function classroomOf(Request $request, Classroom $classroom): Classroom
    {
        abort_unless($classroom->teacher_id === $this->teacher($request)->id, 404);

        return $classroom;
    }

    private function studentOf(Request $request, Student $student): Student
    {
        abort_unless($student->classroom->teacher_id === $this->teacher($request)->id && ! $student->anonymized_at, 404);

        return $student;
    }

    public static function classroomData(Classroom $classroom): array
    {
        return [
            'id' => $classroom->id,
            'name' => $classroom->name,
            'grade' => $classroom->grade,
            'code' => $classroom->code,
            'link' => $classroom->code ? Settings::publicUrl().'/unirse/'.$classroom->code : null,
            'open' => $classroom->open,
            'archived' => $classroom->archived_at !== null,
            'students' => $classroom->students_count ?? $classroom->students()->count(),
        ];
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['teacher' => self::summary($this->teacher($request))]);
    }

    // El docente arma su cimarrón con todas las piezas desbloqueadas, sin monedas.
    public function saveAvatar(Request $request): JsonResponse
    {
        $groups = array_keys(config('avatar.defaults'));
        $data = $request->validate([
            'avatar' => ['required', 'array:'.implode(',', $groups)],
            'avatar.*' => ['string', 'max:40'],
        ]);
        $teacher = $this->teacher($request);
        foreach ($data['avatar'] as $group => $id) {
            if (\App\Support\Cimacoins::price("{$group}/{$id}") === false) {
                throw ValidationException::withMessages(['avatar' => 'Esa pieza no existe.']);
            }
        }
        $teacher->avatar = \App\Support\Cimacoins::teacherAvatar($data['avatar']);
        $teacher->save();

        return response()->json(['avatar' => $teacher->avatar]);
    }

    public function logout(Request $request): JsonResponse
    {
        DeviceAuth::revoke($request->attributes->get('device_session')->id);

        return response()->json(['ok' => true])->withCookie(DeviceAuth::forget($request, 'teacher'));
    }

    public function classrooms(Request $request): JsonResponse
    {
        $classrooms = $this->teacher($request)->classrooms()->withCount('students')
            ->orderByRaw('archived_at is not null')->orderByDesc('created_at')->get();

        return response()->json(['classrooms' => $classrooms->map(fn ($c) => self::classroomData($c))]);
    }

    private static function classroomRules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:60'],
            'grade' => ['required', 'string', 'min:1', 'max:30'],
        ];
    }

    public function createClassroom(Request $request): JsonResponse
    {
        $data = $request->validate(self::classroomRules());
        $teacher = $this->teacher($request);
        if ($teacher->classrooms()->whereNull('archived_at')->count() >= 30) {
            throw ValidationException::withMessages(['name' => 'Ya tienes 30 grupos activos. Archiva alguno para crear otro.']);
        }
        $classroom = new Classroom(['name' => trim($data['name']), 'grade' => trim($data['grade'])]);
        $classroom->teacher_id = $teacher->id;
        // Dos grupos creados al mismo tiempo podrían sacar el mismo código: se reintenta.
        for ($try = 0; ; $try++) {
            try {
                $classroom->code = Classroom::newCode();
                $classroom->save();
                break;
            } catch (QueryException $e) {
                if ($try >= 3) {
                    throw $e;
                }
            }
        }
        Audit::log('teacher', $teacher->id, 'crear-grupo', 'classroom', $classroom->id);

        return response()->json(['classroom' => self::classroomData($classroom)], 201);
    }

    public function updateClassroom(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $data = $request->validate([
            'name' => ['sometimes', ...self::classroomRules()['name']],
            'grade' => ['sometimes', ...self::classroomRules()['grade']],
            'open' => ['sometimes', 'boolean'],
        ]);
        if (! $classroom->isActive()) {
            return response()->json(['message' => 'El grupo está archivado.'], 422);
        }
        $classroom->fill(collect($data)->only(['name', 'grade'])->map(fn ($v) => trim($v))->all());
        if (array_key_exists('open', $data)) {
            $classroom->open = $data['open'];
        }
        $classroom->save();

        return response()->json(['classroom' => self::classroomData($classroom)]);
    }

    // Cambia el código si se filtró. Los alumnos que ya entraron siguen dentro.
    public function newCode(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        if (! $classroom->isActive()) {
            return response()->json(['message' => 'El grupo está archivado.'], 422);
        }
        $classroom->code = Classroom::newCode();
        $classroom->save();
        Audit::log('teacher', $this->teacher($request)->id, 'cambiar-codigo', 'classroom', $classroom->id);

        return response()->json(['classroom' => self::classroomData($classroom)]);
    }

    // Al archivar se libera el código y, pasado el plazo de privacidad, se borran los nombres.
    public function archive(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $classroom->archived_at = now();
        $classroom->code = null;
        $classroom->open = false;
        $classroom->save();
        Audit::log('teacher', $this->teacher($request)->id, 'archivar-grupo', 'classroom', $classroom->id);

        return response()->json(['classroom' => self::classroomData($classroom)]);
    }

    public function students(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $students = $classroom->students()->whereNull('anonymized_at')->orderBy('name')->get();

        return response()->json([
            'classroom' => self::classroomData($classroom),
            'students' => $students->map(fn (Student $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'return_code' => $s->returnCode(),
                'joined_at' => $s->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function renameStudent(Request $request, Student $student): JsonResponse
    {
        $student = $this->studentOf($request, $student);
        $data = $request->validate(['name' => Student::nameRules()]);
        $name = Student::cleanName($data['name']);
        $key = Student::nameKey($name);
        if (Student::where('classroom_id', $student->classroom_id)->where('name_key', $key)->where('id', '!=', $student->id)->exists()) {
            throw ValidationException::withMessages(['name' => 'Ya hay alguien con ese nombre en el grupo.']);
        }
        $student->name = $name;
        $student->name_key = $key;
        $student->save();

        return response()->json(['student' => ['id' => $student->id, 'name' => $student->name]]);
    }

    public function deleteStudent(Request $request, Student $student): JsonResponse
    {
        $student = $this->studentOf($request, $student);
        DeviceAuth::revokeAll('student', $student->id);
        Audit::log('teacher', $this->teacher($request)->id, 'borrar-alumno', 'student', $student->id);
        $student->delete();

        return response()->json(['ok' => true]);
    }

    // Por ejemplo si alguien más usó su código: cierra sus sesiones y le da un código nuevo.
    public function resetStudentAccess(Request $request, Student $student): JsonResponse
    {
        $student = $this->studentOf($request, $student);
        $closed = DeviceAuth::revokeAll('student', $student->id);
        $code = $student->assignReturnCode();
        $student->save();
        Audit::log('teacher', $this->teacher($request)->id, 'reiniciar-acceso-alumno', 'student', $student->id);

        return response()->json(['closed_sessions' => $closed, 'return_code' => $code]);
    }

    public static function activeClassroomRule(): array
    {
        return [Rule::exists('classrooms', 'id')->whereNull('archived_at')];
    }
}
