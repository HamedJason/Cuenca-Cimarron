<?php

namespace App\Support;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

// Ajustes que se cambian desde el panel de administración en lugar de .env.
// Los que llevan datos sensibles se guardan cifrados con la APP_KEY.
class Settings
{
    private const ENCRYPTED = ['mail_password', 'backup_key'];

    private static array $cache = [];

    public static function get(string $key, mixed $default = null): mixed
    {
        if (! array_key_exists($key, self::$cache)) {
            $value = DB::table('settings')->where('key', $key)->value('value');
            if ($value !== null && in_array($key, self::ENCRYPTED, true)) {
                try {
                    $value = Crypt::decryptString($value);
                } catch (\Throwable) {
                    $value = null;
                }
            }
            self::$cache[$key] = $value;
        }

        return self::$cache[$key] ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        $stored = $value !== null && in_array($key, self::ENCRYPTED, true) ? Crypt::encryptString($value) : $value;
        DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $stored, 'updated_at' => now()]);
        self::$cache[$key] = $value;
    }

    public static function forget(): void
    {
        self::$cache = [];
    }

    // Dominio público: el del panel tiene prioridad sobre el de .env.
    public static function domain(): ?string
    {
        $domain = self::get('domain') ?: config('app.dominio');

        return $domain ? strtolower(trim($domain)) : null;
    }

    // Dirección base para armar enlaces de correos.
    public static function publicUrl(): string
    {
        $url = self::get('public_url');
        if ($url) {
            return rtrim($url, '/');
        }
        $domain = self::domain();
        if ($domain) {
            return 'https://'.$domain;
        }
        // Sin dominio configurado se usa la dirección con la que entró quien hizo la petición.
        $host = app()->bound('request') ? request()->getSchemeAndHttpHost() : '';

        return $host !== '' && $host !== 'http://:' ? $host : rtrim((string) config('app.url'), '/');
    }
}
