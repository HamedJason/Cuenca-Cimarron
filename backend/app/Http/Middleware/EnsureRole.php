<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// rol:admin, rol:school o rol:school,aprobada (escuela ya aprobada por el administrador).
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role, ?string $state = null): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Necesitas entrar a tu cuenta.'], 401);
        }
        if ($user->role !== $role) {
            return response()->json(['message' => 'Tu cuenta no tiene permiso para esto.'], 403);
        }
        if ($role === 'school' && ! $user->school) {
            return response()->json(['message' => 'Tu cuenta no tiene escuela.'], 403);
        }
        if ($state === 'aprobada' && ! $user->school->isApproved()) {
            return response()->json(['message' => 'Tu escuela todavía no está aprobada.'], 403);
        }

        return $next($request);
    }
}
