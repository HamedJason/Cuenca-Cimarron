<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Códigos de recuperación de contraseña. El sitio no manda correos, así que cada cuenta
// recibe 10 códigos al crearse. Solo se muestran una vez y en la base solo queda su huella.
class RecoveryCodes
{
    public const COUNT = 10;

    // Sin letras ni números que se confundan.
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function normalize(string $code): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $code));
    }

    private static function hash(string $code): string
    {
        return hash_hmac('sha256', self::normalize($code), (string) config('app.key'));
    }

    // Borra los códigos anteriores y crea nuevos. Regresa los códigos para mostrarlos una sola vez.
    public static function generate(User $user): array
    {
        $codes = [];
        while (count($codes) < self::COUNT) {
            $raw = '';
            for ($i = 0; $i < 8; $i++) {
                $raw .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
            $codes[substr($raw, 0, 4).'-'.substr($raw, 4)] = true;
        }
        $codes = array_keys($codes);
        DB::transaction(function () use ($user, $codes): void {
            DB::table('recovery_codes')->where('user_id', $user->id)->delete();
            DB::table('recovery_codes')->insert(array_map(fn ($code) => [
                'user_id' => $user->id,
                'code_hash' => self::hash($code),
                'created_at' => now(),
            ], $codes));
        });

        return $codes;
    }

    public static function left(User $user): int
    {
        return DB::table('recovery_codes')->where('user_id', $user->id)->whereNull('used_at')->count();
    }

    // Marca el código como usado si es válido para esa cuenta.
    public static function consume(User $user, string $code): bool
    {
        if (strlen(self::normalize($code)) !== 8) {
            return false;
        }

        return DB::table('recovery_codes')
            ->where('user_id', $user->id)
            ->where('code_hash', self::hash($code))
            ->whereNull('used_at')
            ->update(['used_at' => now()]) === 1;
    }
}
