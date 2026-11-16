<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

// Bitácora de acciones de administradores, escuelas y docentes.
class Audit
{
    public static function log(string $actorType, ?int $actorId, string $action, ?string $subjectType = null, ?int $subjectId = null, array $details = []): void
    {
        DB::table('audit_logs')->insert([
            'actor_type' => $actorType,
            'actor_id' => $actorId,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'details' => $details ? json_encode($details, JSON_UNESCAPED_UNICODE) : null,
            'created_at' => now(),
        ]);
    }
}
