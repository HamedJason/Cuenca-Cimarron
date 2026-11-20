<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Classroom extends Model
{
    protected $fillable = ['name', 'grade'];

    protected function casts(): array
    {
        return ['open' => 'boolean', 'archived_at' => 'datetime'];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    // Código de 6 números que no tenga otro grupo activo.
    public static function newCode(): string
    {
        do {
            $code = (string) random_int(100000, 999999);
        } while (DB::table('classrooms')->where('code', $code)->exists());

        return $code;
    }

    public function isActive(): bool
    {
        return $this->archived_at === null;
    }
}
