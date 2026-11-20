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
// Viene incluido en database/data (Tijuana y Playas de Rosarito, SEP 2026) y se carga solo al arrancar
// si la tabla está vacía (php artisan escuelas:catalogo). El administrador también puede actualizarlo
// desde el panel: su navegador lo pide a datos.gob.mx y lo manda aquí por partes.
class SchoolCatalogController extends Controller
{
    public const BUNDLED = 'database/data/catalogo-escuelas-2026.json.gz';

    // Palabras que no ayudan a buscar: "escuela forjadores de baja california" busca forjadores, baja y california.
    private const STOPWORDS = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'a', 'escuela', 'esc'];

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
            $words = array_values(array_filter(
                explode(' ', str_replace(['%', '_', ',', '.', '"', "'"], ' ', self::searchKey($q))),
                fn ($w) => $w !== '' && ! in_array($w, self::STOPWORDS, true),
            ));
            $words = array_slice($words, 0, 6);
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
        $rows = self::rows($data['schools']);
        self::save($rows);
        if ($request->boolean('first')) {
            Audit::log('admin', $request->user()->id, 'actualizar-catalogo-escuelas');
        }

        return response()->json(['saved' => count($rows), 'total' => DB::table('school_catalog')->count()]);
    }

    // Filas para la tabla. La llave de búsqueda junta nombre, colonia, nivel y CCT, sin acentos ni mayúsculas.
    public static function rows(array $schools): array
    {
        $now = now();

        return array_map(fn ($s) => [
            'cct' => $s['cct'],
            'name' => $s['name'],
            'name_search' => self::searchKey($s['name'], $s['colonia'] ?? '', $s['level_detail'] ?? '', $s['cct']),
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
        ], $schools);
    }

    public static function save(array $rows): void
    {
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('school_catalog')->upsert($chunk, ['cct'], array_keys(array_diff_key($chunk[0], ['cct' => true])));
        }
    }

    // Carga el catálogo incluido en el repositorio. Regresa cuántas escuelas guardó.
    public static function loadBundled(): int
    {
        $raw = @file_get_contents(base_path(self::BUNDLED));
        $json = $raw !== false ? gzdecode($raw) : false;
        $schools = $json !== false ? json_decode($json, true) : null;
        if (! is_array($schools)) {
            return 0;
        }
        $valid = array_values(array_filter($schools, fn ($s) => is_array($s)
            && preg_match(SchoolController::CCT_PATTERN, (string) ($s['cct'] ?? ''))
            && is_string($s['name'] ?? null)
            && in_array($s['municipality'] ?? null, ['Tijuana', 'Playas de Rosarito'], true)
            && in_array($s['level'] ?? null, [...School::LEVELS, null], true)
            && in_array($s['shift'] ?? null, [...School::SHIFTS, null], true)
            && in_array($s['sector'] ?? null, [...School::SECTORS, null], true)));
        self::save(self::rows($valid));

        return count($valid);
    }

    // Al arrancar el sitio: carga el catálogo incluido si la tabla está vacía o si el archivo cambió.
    // Solo agrega o actualiza escuelas del catálogo (upsert por CCT): nunca borra nada ni toca las
    // escuelas registradas. Regresa cuántas guardó, o null si no hacía falta.
    public static function ensureBundled(bool $force = false): ?int
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('school_catalog')) {
            return null;
        }
        $file = base_path(self::BUNDLED);
        $version = is_file($file) ? hash_file('sha256', $file) : null;
        if ($version === null) {
            return null;
        }
        $empty = ! DB::table('school_catalog')->exists();
        if (! $force && ! $empty && \App\Support\Settings::get('catalogo-escuelas.version') === $version) {
            return null;
        }
        $total = self::loadBundled();
        if ($total > 0) {
            \App\Support\Settings::set('catalogo-escuelas.version', $version);
        }

        return $total;
    }
}
