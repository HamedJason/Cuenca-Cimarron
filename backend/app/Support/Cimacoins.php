<?php

namespace App\Support;

use App\Http\Controllers\ActivityController;
use App\Models\Student;

// Cartera de Cimacoins y avatar de un alumno con sesión. Las mismas reglas que
// frontend/src/avatar/economy.js, con los datos de config/avatar-catalogo.json.
//
// Saldo = monedas iniciales + puntos × per_point + premios recibidos − lo gastado.
// Los puntos no se tocan nunca: el docente los ve completos aunque el alumno compre.
class Cimacoins
{
    public static function today(): string
    {
        return now(config('avatar.timezone'))->toDateString();
    }

    // Lo guardado en students.wallet, con la forma esperada aunque venga vacío.
    public static function stored(Student $student): array
    {
        $w = is_array($student->wallet) ? $student->wallet : [];
        $strings = fn ($v) => is_array($v) ? array_values(array_unique(array_filter($v, 'is_string'))) : [];

        return [
            'spent' => max(0, (int) ($w['spent'] ?? 0)),
            'bonus' => max(0, (int) ($w['bonus'] ?? 0)),
            'owned' => $strings($w['owned'] ?? []),
            'claimed' => $strings($w['claimed'] ?? []),
            'daily_claims' => is_array($w['daily_claims'] ?? null) ? $w['daily_claims'] : [],
            'completed' => $strings($w['completed'] ?? []),
            'daily' => is_string($w['daily'] ?? null) ? $w['daily'] : '',
            'angelic' => ($w['angelic'] ?? false) === true,
        ];
    }

    public static function coins(Student $student, ?array $wallet = null, ?int $points = null): int
    {
        $wallet ??= self::stored($student);
        $points ??= ActivityController::total($student->id);

        return (int) config('avatar.starter') + $points * (int) config('avatar.per_point') + $wallet['bonus'] - $wallet['spent'];
    }

    // Lo que recibe el navegador. extra = saldo sin los puntos, para que el saldo
    // se actualice solo cuando el alumno gana puntos (coins = extra + puntos × per_point).
    public static function forClient(Student $student, ?array $wallet = null): array
    {
        $wallet ??= self::stored($student);
        $points = ActivityController::total($student->id);
        $coins = self::coins($student, $wallet, $points);

        return [
            'version' => 1,
            'coins' => $coins,
            'extra' => $coins - $points * (int) config('avatar.per_point'),
            'perPoint' => (int) config('avatar.per_point'),
            'owned' => $wallet['owned'],
            'claimed' => $wallet['claimed'],
            'dailyClaims' => (object) $wallet['daily_claims'],
            'completed' => $wallet['completed'],
            'daily' => $wallet['daily'],
            'angelic' => $wallet['angelic'],
        ];
    }

    // Precio de una pieza: 0 inicial, null no se vende, false no existe.
    public static function price(string $key): int|null|false
    {
        $items = config('avatar.items');

        return array_key_exists($key, $items) ? $items[$key] : false;
    }

    public static function owns(array $wallet, string $key): bool
    {
        return self::price($key) === 0 || in_array($key, $wallet['owned'], true);
    }

    // Precio de un kit con 20 % de descuento en lo que falta. null si incluye algo que no se vende.
    public static function kitPrice(array $wallet, array $state): ?int
    {
        $subtotal = 0;
        foreach ($state as $group => $id) {
            $key = "{$group}/{$id}";
            if (self::owns($wallet, $key)) {
                continue;
            }
            $price = self::price($key);
            if (! is_int($price)) {
                return null;
            }
            $subtotal += $price;
        }

        return (int) (ceil($subtotal * (1 - (float) config('avatar.bundle_discount')) / 5) * 5);
    }

    // Avatar con una pieza por grupo. Lo que no exista o no sea suyo vuelve a la pieza inicial.
    // Los avatares del formato anterior ({background, pieces}) quedan con las piezas iniciales.
    public static function avatar(Student $student, ?array $wallet = null, ?array $candidate = null): array
    {
        $wallet ??= self::stored($student);
        $candidate ??= is_array($student->avatar) ? $student->avatar : [];
        $result = [];
        foreach (config('avatar.defaults') as $group => $default) {
            $id = $candidate[$group] ?? null;
            $result[$group] = is_string($id) && self::price("{$group}/{$id}") !== false && self::owns($wallet, "{$group}/{$id}") ? $id : $default;
        }

        return $result;
    }

    // El docente tiene todas las piezas: solo se revisa que existan en el catálogo.
    public static function teacherAvatar(?array $candidate): array
    {
        $candidate ??= [];
        $result = [];
        foreach (config('avatar.defaults') as $group => $default) {
            $id = $candidate[$group] ?? null;
            $result[$group] = is_string($id) && self::price("{$group}/{$id}") !== false ? $id : $default;
        }

        return $result;
    }
}
