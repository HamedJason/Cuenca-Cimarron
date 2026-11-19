<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    protected $fillable = ['name'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'avatar' => 'array'];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }
}
