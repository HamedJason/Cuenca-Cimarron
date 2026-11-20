<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// rol:admin, rol:admin|viewer (cualquiera de los dos), rol:school o rol:school,aprobada (escuela con acceso, no suspendida).
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role, ?string $state = null): Response
    {
        // Si el modo demostración ya venció, se borra antes de atender (y con él las cuentas demo).
        \App\Support\DemoMode::expireIfNeeded();
        $user = $request->user()?->fresh();
        if (! $user) {
            return response()->json(['message' => 'Necesitas entrar a tu cuenta.'], 401);
        }
        if (! in_array($user->role, explode('|', $role), true)) {
            return response()->json(['message' => 'Tu cuenta no tiene permiso para esto.'], 403);
        }
        if ($role === 'school' && ! $user->school) {
            return response()->json(['message' => 'Tu cuenta no tiene escuela.'], 403);
        }
        if ($state === 'aprobada' && ! $user->school->isApproved()) {
            return response()->json(['message' => 'El acceso de tu escuela está suspendido.'], 403);
        }

        return $next($request);
    }
}
