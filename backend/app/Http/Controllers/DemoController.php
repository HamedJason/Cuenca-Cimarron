<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Support\DemoData;
use App\Support\DeviceAuth;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// Demo de la exposición (/testeo_20nov). Solo existe con el modo demostración encendido desde el panel
// (Sistema). Si está apagado todo da 404.
// Entra a las cuentas demo con el mismo mecanismo de sesión que usa el sitio de verdad:
// sesión de Laravel para la administración y la escuela, y cookie del equipo para docente y alumno.
class DemoController extends Controller
{
    public const ROLES = ['admin', 'escuela', 'profesor', 'alumno'];

    private static function guard(): void
    {
        abort_unless(\App\Support\DemoMode::enabled(), 404);
    }

    public function info(): JsonResponse
    {
        self::guard();
        $school = DemoData::user('escuela')?->school;
        $teacher = $school ? Teacher::where('school_id', $school->id)->first() : null;
        $classrooms = $teacher ? DB::table('classrooms')->where('teacher_id', $teacher->id)->orderBy('id')->get(['name', 'code']) : collect();

        return response()->json([
            'ready' => DemoData::exists(),
            'school' => $school?->name,
            'other_school' => DemoData::user('pendiente')?->school?->name,
            'until' => \App\Support\DemoMode::until()?->toIso8601String(),
            'teacher' => $teacher?->name,
            'classrooms' => $classrooms,
            'student_code' => Settings::get('demo20nov.codigo-alumno'),
        ])->header('Cache-Control', 'no-store');
    }

    public function enter(Request $request, string $role): JsonResponse
    {
        self::guard();
        if (! DemoData::exists()) {
            return response()->json(['message' => 'Faltan los datos demo. Apaga y vuelve a encender el modo demostración en el panel.'], 409);
        }
        $response = response()->json(['ok' => true, 'role' => $role]);
        // Se cierra lo que hubiera antes para no mezclar cuentas
        Auth::guard('web')->logout();
        $response->withCookie(DeviceAuth::forget($request, 'teacher'))->withCookie(DeviceAuth::forget($request, 'student'));

        if ($role === 'admin' || $role === 'escuela') {
            Auth::login(DemoData::user($role === 'admin' ? 'admin' : 'escuela'));
            $request->session()->regenerate();

            return $response;
        }
        $school = DemoData::user('escuela')->school;
        $teacher = Teacher::where('school_id', $school->id)->firstOrFail();
        if ($role === 'profesor') {
            return $response->withCookie(DeviceAuth::issue($request, 'teacher', $teacher->id));
        }
        $student = Student::whereIn('classroom_id', DB::table('classrooms')->where('teacher_id', $teacher->id)->pluck('id'))
            ->where('name', DemoData::STUDENTS[0])->firstOrFail();

        return $response->withCookie(DeviceAuth::issue($request, 'student', $student->id));
    }

    public function leave(Request $request): JsonResponse
    {
        self::guard();
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        foreach (['teacher', 'student'] as $kind) {
            $session = DeviceAuth::resolve($request, $kind);
            if ($session) {
                DeviceAuth::revoke($session->id);
            }
        }

        return response()->json(['ok' => true])
            ->withCookie(DeviceAuth::forget($request, 'teacher'))
            ->withCookie(DeviceAuth::forget($request, 'student'));
    }
}
