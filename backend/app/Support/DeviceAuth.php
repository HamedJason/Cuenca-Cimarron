<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Cookie;

// Cookies de larga duración para alumnos y docentes. El navegador guarda un token al azar
// y en la base solo queda su huella, así que copiar la base no deja entrar a nadie.
class DeviceAuth
{
    public const DAYS = 400;

    public const COOKIES = ['student' => 'cc_alumno', 'teacher' => 'cc_docente'];

    // Equipos con sesión abierta al mismo tiempo. Al pasar el límite se cierra la más vieja.
    public const LIMITS = ['student' => 3, 'teacher' => 5];

    public static function issue(Request $request, string $kind, int $ownerId): Cookie
    {
        $token = bin2hex(random_bytes(32));
        DB::transaction(function () use ($kind, $ownerId, $token): void {
            DB::table('device_sessions')->insert([
                'kind' => $kind,
                'owner_id' => $ownerId,
                'token_hash' => hash('sha256', $token),
                'last_used_on' => now()->toDateString(),
                'expires_at' => now()->addDays(self::DAYS),
                'created_at' => now(),
            ]);
            $active = DB::table('device_sessions')
                ->where('kind', $kind)->where('owner_id', $ownerId)
                ->whereNull('revoked_at')->where('expires_at', '>', now())
                ->orderByDesc('id')->pluck('id');
            if ($active->count() > self::LIMITS[$kind]) {
                DB::table('device_sessions')->whereIn('id', $active->slice(self::LIMITS[$kind])->all())->update(['revoked_at' => now()]);
            }
        });

        return self::cookie($request, $kind, $token, self::DAYS * 24 * 60);
    }

    public static function forget(Request $request, string $kind): Cookie
    {
        return self::cookie($request, $kind, '', -60);
    }

    private static function cookie(Request $request, string $kind, string $value, int $minutes): Cookie
    {
        return cookie(self::COOKIES[$kind], $value, $minutes, '/', null, $request->secure(), true, false, 'lax');
    }

    // Regresa la sesión del equipo o null. Actualiza el último uso como mucho una vez al día.
    public static function resolve(Request $request, string $kind): ?object
    {
        $token = (string) $request->cookie(self::COOKIES[$kind]);
        if (strlen($token) !== 64 || ! ctype_xdigit($token)) {
            return null;
        }
        $session = DB::table('device_sessions')
            ->where('token_hash', hash('sha256', $token))
            ->where('kind', $kind)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
        if (! $session) {
            return null;
        }
        $session->renewed = false;
        if ($session->last_used_on < now()->toDateString()) {
            DB::table('device_sessions')->where('id', $session->id)->update([
                'last_used_on' => now()->toDateString(),
                'expires_at' => now()->addDays(self::DAYS),
            ]);
            $session->renewed = true;
            self::maybeCleanup();
        }
        $session->token = $token;

        return $session;
    }

    public static function renewCookie(Request $request, object $session): Cookie
    {
        return self::cookie($request, $session->kind, $session->token, self::DAYS * 24 * 60);
    }

    public static function revoke(int $sessionId): void
    {
        DB::table('device_sessions')->where('id', $sessionId)->update(['revoked_at' => now()]);
    }

    public static function revokeAll(string $kind, int $ownerId): int
    {
        return DB::table('device_sessions')->where('kind', $kind)->where('owner_id', $ownerId)
            ->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }

    // Limpieza de vez en cuando al atender peticiones, sin programador aparte.
    public static function maybeCleanup(bool $force = false): void
    {
        if (! $force && random_int(1, 50) !== 1) {
            return;
        }
        DB::table('device_sessions')->where(function ($q): void {
            $q->where('expires_at', '<', now())->orWhere('revoked_at', '<', now()->subDays(30));
        })->delete();
        DB::table('teacher_invites')->where('expires_at', '<', now()->subDays(30))->delete();
        DB::table('account_tokens')->where('expires_at', '<', now()->subDays(7))->delete();
        Privacy::anonymizeOldClassrooms();
    }
}
