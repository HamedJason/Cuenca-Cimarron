<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Student extends Model
{
    // Sin letras ni números que se confundan: sin O, 0, I, 1.
    private const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    private const DIGITS = '23456789';

    // Palabras que no se aceptan como nombre. La lista es corta a propósito.
    private const BLOCKED = ['puto', 'puta', 'pendejo', 'pendeja', 'verga', 'culero', 'culera', 'mierda', 'chinga', 'cabron', 'cabrona', 'joto', 'pinche', 'mamon', 'idiota', 'estupido', 'estupida', 'admin', 'administrador', 'maestro', 'maestra'];

    protected $fillable = ['name'];

    protected function casts(): array
    {
        return ['avatar' => 'array', 'anonymized_at' => 'datetime'];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    // "Ana  M." y "ana m" son el mismo nombre dentro del grupo.
    public static function nameKey(string $name): string
    {
        $key = Str::of($name)->ascii()->lower()->replace('.', '')->squish()->toString();

        return mb_substr($key, 0, 40);
    }

    public static function cleanName(string $name): string
    {
        return Str::of($name)->squish()->toString();
    }

    public static function nameRules(): array
    {
        return ['required', 'string', 'min:2', 'max:30', 'regex:/^[\pL][\pL .]*$/u', function (string $attribute, mixed $value, \Closure $fail): void {
            foreach (explode(' ', self::nameKey((string) $value)) as $word) {
                if (in_array($word, self::BLOCKED, true)) {
                    $fail('Escribe tu nombre real, por favor.');

                    return;
                }
            }
        }];
    }

    public static function normalizeReturnCode(string $code): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $code));
    }

    public static function hashReturnCode(string $code): string
    {
        return hash_hmac('sha256', self::normalizeReturnCode($code), (string) config('app.key'));
    }

    // Genera un código personal como LMX-482 y lo guarda en el alumno.
    public function assignReturnCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 3; $i++) {
                $code .= self::LETTERS[random_int(0, strlen(self::LETTERS) - 1)];
            }
            $code .= '-';
            for ($i = 0; $i < 3; $i++) {
                $code .= self::DIGITS[random_int(0, strlen(self::DIGITS) - 1)];
            }
            $hash = self::hashReturnCode($code);
        } while (DB::table('students')->where('return_code_hash', $hash)->exists());
        $this->return_code_hash = $hash;
        $this->return_code_encrypted = Crypt::encryptString($code);

        return $code;
    }

    public function returnCode(): ?string
    {
        try {
            return $this->return_code_encrypted ? Crypt::decryptString($this->return_code_encrypted) : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
