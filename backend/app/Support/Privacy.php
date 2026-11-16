<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Privacy
{
    // Días que se guardan los nombres después de archivar un grupo.
    public const KEEP_NAMES_DAYS = 60;

    // Borra los nombres y códigos de los alumnos de grupos archivados hace más del plazo.
    // Las actividades completadas se quedan para las cifras generales, ya sin nombre.
    public static function anonymizeOldClassrooms(): int
    {
        $ids = DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->whereNotNull('classrooms.archived_at')
            ->where('classrooms.archived_at', '<', now()->subDays(self::KEEP_NAMES_DAYS))
            ->whereNull('students.anonymized_at')
            ->pluck('students.id');
        foreach ($ids as $id) {
            DB::table('students')->where('id', $id)->update([
                'name' => 'Alumno',
                'name_key' => 'anonimo-'.$id,
                'return_code_hash' => null,
                'return_code_encrypted' => null,
                'anonymized_at' => now(),
            ]);
            DB::table('device_sessions')->where('kind', 'student')->where('owner_id', $id)->update(['revoked_at' => now()]);
        }

        return $ids->count();
    }
}
