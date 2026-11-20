<?php

namespace App\Support;

use App\Models\School;
use App\Models\User;
use Illuminate\Support\Carbon;

// Modo demostración (/testeo_20nov). Se enciende y se apaga desde el panel de administración,
// sin variables de entorno. Al encenderlo se crean los datos demo; al apagarlo se borran.
// Se apaga solo a las 24 horas, porque /testeo_20nov deja entrar a las cuentas demo sin contraseña.
// DEMO_20NOV=true en el entorno lo deja encendido a la fuerza (solo para pruebas locales).
class DemoMode
{
    public const KEY = 'demo20nov.hasta';

    public const HOURS = 24;

    public static function until(): ?Carbon
    {
        $value = Settings::get(self::KEY);

        return $value ? Carbon::parse($value) : null;
    }

    public static function forced(): bool
    {
        return (bool) config('demo.enabled');
    }

    public static function enabled(): bool
    {
        self::expireIfNeeded();
        $until = self::until();

        return self::forced() || ($until !== null && $until->isFuture());
    }

    public static function turnOn(): Carbon
    {
        DemoData::seed();
        $until = now()->addHours(self::HOURS);
        Settings::set(self::KEY, $until->toIso8601String());

        return $until;
    }

    public static function turnOff(): void
    {
        DemoData::wipe();
        Settings::set(self::KEY, null);
    }

    // Se llama al atender peticiones con sesión: si ya pasaron las 24 horas, borra todo lo demo.
    public static function expireIfNeeded(): void
    {
        $until = self::until();
        if ($until !== null && ! $until->isFuture() && ! self::forced()) {
            self::turnOff();
        }
    }

    public static function isDemoUser(?User $user): bool
    {
        return $user !== null && str_ends_with(strtolower((string) $user->email), '@'.config('demo.domain'));
    }

    public static function isDemoSchool(School $school): bool
    {
        return self::isDemoUser($school->user);
    }
}
