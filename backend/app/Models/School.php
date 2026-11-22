<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    public const LEVELS = ['preescolar', 'primaria', 'secundaria', 'media-superior'];

    public const SHIFTS = ['matutino', 'vespertino', 'nocturno', 'completo'];

    public const SECTORS = ['publica', 'privada'];

    protected $guarded = ['id', 'status', 'reviewed_by', 'reviewed_at'];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'reviewed_at' => 'datetime',
            'families_informed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teachers(): HasMany
    {
        return $this->hasMany(Teacher::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function toPublic(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cct' => $this->cct,
            'level' => $this->level,
            'shift' => $this->shift,
            'sector' => $this->sector,
            'colonia' => $this->colonia,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'contact_name' => $this->contact_name,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
        ];
    }
}
