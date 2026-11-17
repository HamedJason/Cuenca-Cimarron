<?php

namespace App\Http\Middleware;

use App\Models\Student;
use App\Models\Teacher;
use App\Support\DeviceAuth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// equipo:student o equipo:teacher. Busca la cookie del equipo y deja al dueño en la petición.
// En las peticiones que cambian algo revisa que vengan del mismo sitio.
class DeviceSession
{
    public function handle(Request $request, Closure $next, string $kind, ?string $optional = null): Response
    {
        if (! $request->isMethodSafe() && ! self::sameOrigin($request)) {
            return response()->json(['message' => 'Petición de otro sitio.'], 403);
        }
        $session = DeviceAuth::resolve($request, $kind);
        $owner = null;
        if ($session) {
            $owner = $kind === 'student'
                ? Student::with('classroom.teacher.school')->whereNull('anonymized_at')->find($session->owner_id)
                : Teacher::with('school')->where('active', true)->find($session->owner_id);
        }
        if (! $owner && $optional !== 'opcional') {
            return response()->json(['message' => $kind === 'student' ? 'Entra con el código de tu grupo.' : 'Abre de nuevo el enlace que te dio tu escuela.'], 401);
        }
        // Si la escuela está suspendida, sus docentes y alumnos no pueden entrar.
        $school = $owner ? ($kind === 'student' ? $owner->classroom?->teacher?->school : $owner->school) : null;
        if ($owner && (! $school || ! $school->isApproved())) {
            $owner = null;
            if ($optional !== 'opcional') {
                return response()->json(['message' => 'Tu escuela no tiene acceso por ahora.'], 403);
            }
        }
        $request->attributes->set('device_session', $owner ? $session : null);
        $request->attributes->set($kind, $owner);
        $response = $next($request);
        if ($owner && $session->renewed) {
            $response->headers->setCookie(DeviceAuth::renewCookie($request, $session));
        }

        return $response;
    }

    public static function sameOrigin(Request $request): bool
    {
        if ($request->headers->get('Sec-Fetch-Site') === 'cross-site') {
            return false;
        }
        $origin = $request->headers->get('Origin');
        if ($origin === null || $origin === 'null') {
            return $origin === null;
        }

        return parse_url($origin, PHP_URL_HOST) === $request->getHost();
    }
}
