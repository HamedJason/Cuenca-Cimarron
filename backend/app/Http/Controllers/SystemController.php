<?php

namespace App\Http\Controllers;

use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    // Commit que está corriendo y si la base responde. Sirve para confirmar que llegó una actualización.
    public function version(): JsonResponse
    {
        try {
            DB::select('select 1');
            $database = true;
        } catch (\Throwable) {
            $database = false;
        }

        return response()->json([
            'commit' => config('app.commit'),
            'database' => $database,
        ], $database ? 200 : 503)->header('Cache-Control', 'no-store');
    }

    // Caddy pregunta aquí antes de pedir un certificado. Solo se aprueba el dominio configurado.
    public function allowCertificate(Request $request): Response
    {
        $requested = strtolower((string) $request->query('domain'));
        $domain = Settings::domain();

        return response('', $domain && hash_equals($domain, $requested) ? 200 : 404);
    }
}
