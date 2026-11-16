<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Tokens de un solo uso para confirmar el correo y recuperar la contraseña.
// En la base solo se guarda su huella.
class AccountTokens
{
    public static function create(User $user, string $type, int $minutes): string
    {
        $token = bin2hex(random_bytes(32));
        DB::table('account_tokens')->where('user_id', $user->id)->where('type', $type)->whereNull('used_at')->delete();
        DB::table('account_tokens')->insert([
            'user_id' => $user->id,
            'type' => $type,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addMinutes($minutes),
            'created_at' => now(),
        ]);

        return $token;
    }

    // Marca el token como usado y regresa su usuario, o null si no sirve.
    public static function consume(string $token, string $type): ?User
    {
        return DB::transaction(function () use ($token, $type): ?User {
            $row = DB::table('account_tokens')
                ->where('token_hash', hash('sha256', $token))
                ->where('type', $type)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();
            if (! $row) {
                return null;
            }
            DB::table('account_tokens')->where('id', $row->id)->update(['used_at' => now()]);

            return User::find($row->user_id);
        });
    }
}
