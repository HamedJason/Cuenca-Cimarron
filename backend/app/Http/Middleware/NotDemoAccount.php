<?php

namespace App\Http\Middleware;

use App\Support\DemoMode;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// sin-demo: la cuenta de demostración no puede hacer esto (respaldos, cuentas, bitácora, ajustes...).
// Así nadie que entre por /testeo_20nov puede ver ni tocar datos reales.
class NotDemoAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        if (DemoMode::isDemoUser($request->user())) {
            return response()->json(['message' => 'La cuenta de demostración no puede hacer esto.'], 403);
        }

        return $next($request);
    }
}
