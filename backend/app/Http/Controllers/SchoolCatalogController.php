<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

// Catálogo oficial de escuelas para buscar la propia al registrarse.
// El administrador lo carga desde el panel: su navegador lo pide a datos.gob.mx y lo manda aquí por partes.
class SchoolCatalogController extends Controller
{
    public static function searchKey(string ...$parts): string
    {
        return mb_substr(Str::of(implode(' ', $parts))->ascii()->lower()->squish()->toString(), 0, 300);
    }

    public function search(Request $request): JsonResponse
    {
        $data = $request->validate(['q' => ['required', 'string', 'min:2', 'max:80']]);
        $query = DB::table('school_catalog');
        $q = trim($data['q']);
        if (preg_match('/^\d{2}[A-Za-z]{3}\d{4}[A-Za-z]$/', $q)) {
            $query->where('cct', strtoupper($q));
        } else {
            $words = array_slice(array_filter(explode(' ', str_replace(['%', '_'], '', self::searchKey($q)))), 0, 5);
            foreach ($words as $word) {
                $query->where('name_search', 'like', '%'.$word.'%');
            }
            // Para el autocompletado: primero las que empiezan con lo que se escribió.
            if ($words) {
                $query->orderByRaw('case when name_search like ? then 0 else 1 end', [$words[0].'%']);
            }
        }
        $rows = $query->orderBy('name')->limit(12)->get();
        $taken = School::whereIn('cct', $rows->pluck('cct'))->pluck('cct')->all();

        return response()->json(['schools' => $rows->map(fn ($s) => [
            'cct' => $s->cct,
            'name' => $s->name,
            'level' => $s->level,
            'level_detail' => $s->level_detail,
            'shift' => $s->shift,
            'sector' => $s->sector,
            'colonia' => $s->colonia,
            'address' => $s->address,
            'municipality' => $s->municipality,
            'lat' => $s->lat !== null ? (float) $s->lat : null,
            'lng' => $s->lng !== null ? (float) $s->lng : null,
            'registered' => in_array($s->cct, $taken, true),
        ])])->header('Cache-Control', 'no-store');
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'total' => DB::table('school_catalog')->count(),
            'by_municipality' => DB::table('school_catalog')->select('municipality', DB::raw('count(*) as total'))->groupBy('municipality')->pluck('total', 'municipality'),
            'updated_at' => DB::table('school_catalog')->max('updated_at'),
        ]);
    }

    // Recibe una parte del catálogo (hasta 500 escuelas) y la guarda o actualiza.
    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'schools' => ['required', 'array', 'min:1', 'max:500'],
            'schools.*.cct' => ['required', 'string', 'regex:'.SchoolController::CCT_PATTERN],
            'schools.*.name' => ['required', 'string', 'max:200'],
            'schools.*.level' => ['nullable', Rule::in(School::LEVELS)],
            'schools.*.level_detail' => ['nullable', 'string', 'max:60'],
            'schools.*.shift' => ['nullable', Rule::in(School::SHIFTS)],
            'schools.*.sector' => ['nullable', Rule::in(School::SECTORS)],
            'schools.*.colonia' => ['nullable', 'string', 'max:160'],
            'schools.*.address' => ['nullable', 'string', 'max:220'],
            'schools.*.postal_code' => ['nullable', 'string', 'regex:/^\d{5}$/'],
            'schools.*.municipality' => ['required', Rule::in(['Tijuana', 'Playas de Rosarito'])],
            'schools.*.lat' => ['nullable', 'numeric', 'between:31.5,33.5'],
            'schools.*.lng' => ['nullable', 'numeric', 'between:-118,-115.5'],
        ]);
        $now = now();
        $rows = array_map(fn ($s) => [
            'cct' => $s['cct'],
            'name' => $s['name'],
            'name_search' => self::searchKey($s['name'], $s['colonia'] ?? '', $s['cct']),
            'level' => $s['level'] ?? null,
            'level_detail' => $s['level_detail'] ?? null,
            'shift' => $s['shift'] ?? null,
            'sector' => $s['sector'] ?? null,
            'colonia' => $s['colonia'] ?? null,
            'address' => $s['address'] ?? null,
            'postal_code' => $s['postal_code'] ?? null,
            'municipality' => $s['municipality'],
            'lat' => $s['lat'] ?? null,
            'lng' => $s['lng'] ?? null,
            'updated_at' => $now,
        ], $data['schools']);
        DB::table('school_catalog')->upsert($rows, ['cct'], array_keys(array_diff_key($rows[0], ['cct' => true])));
        if ($request->boolean('first')) {
            Audit::log('admin', $request->user()->id, 'actualizar-catalogo-escuelas');
        }

        return response()->json(['saved' => count($rows), 'total' => DB::table('school_catalog')->count()]);
    }
}
