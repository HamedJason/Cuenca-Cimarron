<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Support\Cimacoins;
use App\Support\DeviceAuth;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

// Alumnos: entran con el código del grupo y su nombre, o regresan con su código personal.
class StudentController extends Controller
{
    private static function findClassroom(string $code): ?Classroom
    {
        if (! preg_match('/^\d{6}$/', $code)) {
            return null;
        }

        return Classroom::with('teacher.school')->where('code', $code)->whereNull('archived_at')->first();
    }

    private static function usable(?Classroom $classroom): bool
    {
        return $classroom && $classroom->teacher->active && $classroom->teacher->school->isApproved();
    }

    // Lo que ve el alumno antes de escribir su nombre: "Vas a entrar a 4° B con Laura Pérez".
    public function preview(string $code): JsonResponse
    {
        $classroom = self::findClassroom($code);
        if (! self::usable($classroom)) {
            return response()->json(['message' => 'No encontramos ese código. Revísalo con tu docente.'], 404);
        }

        return response()->json(['classroom' => [
            'name' => $classroom->name,
            'grade' => $classroom->grade,
            'teacher' => $classroom->teacher->name,
            'school' => $classroom->teacher->school->name,
            'open' => $classroom->open,
        ]]);
    }

    public function join(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'size:6'],
            'name' => Student::nameRules(),
        ]);
        // Un grupo entero puede entrar a la vez desde la misma red, así que el límite es por código.
        $limiter = 'unirse:'.$data['code'];
        if (RateLimiter::tooManyAttempts($limiter, 60)) {
            return response()->json(['message' => 'Muchos alumnos entrando a la vez. Espera un minuto.'], 429);
        }
        RateLimiter::hit($limiter, 60);
        $classroom = self::findClassroom($data['code']);
        if (! self::usable($classroom)) {
            throw ValidationException::withMessages(['code' => 'No encontramos ese código. Revísalo con tu docente.']);
        }
        if (! $classroom->open) {
            throw ValidationException::withMessages(['code' => 'Este grupo ya no recibe alumnos nuevos. Si ya habías entrado, usa tu código personal.']);
        }
        $name = Student::cleanName($data['name']);
        $key = Student::nameKey($name);
        $taken = fn () => ValidationException::withMessages(['name' => "Ya hay alguien llamado {$name} en el grupo. Agrega la inicial de tu apellido, por ejemplo \"{$name} M.\". Si ya habías entrado antes, usa tu código personal."]);
        if (Student::where('classroom_id', $classroom->id)->where('name_key', $key)->exists()) {
            throw $taken();
        }
        try {
            $student = DB::transaction(function () use ($classroom, $name, $key): Student {
                $student = new Student(['name' => $name]);
                $student->classroom_id = $classroom->id;
                $student->name_key = $key;
                $student->assignReturnCode();
                $student->save();

                return $student;
            });
        } catch (QueryException) {
            throw $taken();
        }
        $student->setRelation('classroom', $classroom);

        return response()->json(['student' => self::summary($student)], 201)
            ->withCookie(DeviceAuth::issue($request, 'student', $student->id));
    }

    public function comeBack(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:12']]);
        $limiter = 'regresar:'.$request->ip();
        if (RateLimiter::tooManyAttempts($limiter, 30)) {
            $minutes = (int) ceil(RateLimiter::availableIn($limiter) / 60);

            return response()->json(['message' => "Demasiados intentos. Espera {$minutes} min."], 429);
        }
        $code = Student::normalizeReturnCode($data['code']);
        $student = strlen($code) === 6
            ? Student::with('classroom.teacher.school')->where('return_code_hash', Student::hashReturnCode($code))->whereNull('anonymized_at')->first()
            : null;
        if (! $student || ! $student->classroom->isActive() || ! self::usable($student->classroom)) {
            RateLimiter::hit($limiter, 900);
            throw ValidationException::withMessages(['code' => 'Ese código no existe. Revisa que esté bien escrito.']);
        }

        return response()->json(['student' => self::summary($student)])
            ->withCookie(DeviceAuth::issue($request, 'student', $student->id));
    }

    public static function summary(Student $student): array
    {
        $classroom = $student->classroom;

        return [
            'id' => $student->id,
            'name' => $student->name,
            'classroom' => $classroom->name,
            'grade' => $classroom->grade,
            'teacher' => $classroom->teacher->name,
            'school' => $classroom->teacher->school->name,
            'avatar' => Cimacoins::avatar($student),
            'wallet' => Cimacoins::forClient($student),
        ];
    }

    // Lo único que pide el sitio al abrir: quién es el alumno de este equipo, si hay.
    public function me(Request $request): JsonResponse
    {
        $student = $request->attributes->get('student');

        return response()->json([
            'student' => $student ? self::summary($student) : null,
            'progress' => $student ? ActivityController::progress($student->id) : null,
            'tasks' => $student ? AssignmentController::forStudent($student->id, $student->classroom_id) : [],
        ])->header('Cache-Control', 'no-store');
    }

    public function logout(Request $request): JsonResponse
    {
        $session = $request->attributes->get('device_session');
        if ($session) {
            DeviceAuth::revoke($session->id);
        }

        return response()->json(['ok' => true])->withCookie(DeviceAuth::forget($request, 'student'));
    }
}
