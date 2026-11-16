<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Copia config/activities.php a las tablas activities y activity_questions.
// Las actividades que ya no están en el archivo se desactivan, nunca se borran,
// para no perder los puntos que ya se ganaron con ellas.
class Catalog
{
    public static function sync(): int
    {
        if (! Schema::hasTable('activities')) {
            return 0;
        }
        $items = config('activities', []);
        $now = now();
        DB::transaction(function () use ($items, $now): void {
            $keys = [];
            foreach (array_values($items) as $sort => $item) {
                $keys[] = $item['key'];
                DB::table('activities')->updateOrInsert(['key' => $item['key']], [
                    'title' => $item['title'],
                    'kind' => $item['kind'],
                    'mode' => $item['mode'],
                    'points' => $item['points'],
                    'route' => $item['route'],
                    'min_seconds' => $item['min_seconds'] ?? 0,
                    'sort' => $sort,
                    'active' => true,
                    'updated_at' => $now,
                ]);
                $id = DB::table('activities')->where('key', $item['key'])->value('id');
                DB::table('activities')->where('id', $id)->whereNull('created_at')->update(['created_at' => $now]);
                if (isset($item['question'])) {
                    DB::table('activity_questions')->updateOrInsert(['activity_id' => $id], [
                        'text' => $item['question']['text'],
                        'options' => json_encode($item['question']['options'], JSON_UNESCAPED_UNICODE),
                        'answer' => $item['question']['answer'],
                        'updated_at' => $now,
                    ]);
                } else {
                    DB::table('activity_questions')->where('activity_id', $id)->delete();
                }
            }
            DB::table('activities')->whereNotIn('key', $keys)->update(['active' => false, 'updated_at' => $now]);
        });

        return count($items);
    }
}
