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
// Viene incluido en database/data (Tijuana y Playas de Rosarito, SEP 2026) y se carga solo al arrancar.
// Los puntos de las escuelas que la SEP no ubicó vienen del DENUE del INEGI (05/2026), cruzados por
// nombre, colonia y calle con infra/ubicar-escuelas-denue.py. El campo geo dice de dónde salió cada punto.
// si la tabla está vacía (php artisan escuelas:catalogo). El administrador también puede actualizarlo
// desde el panel: su navegador lo pide a datos.gob.mx y lo manda aquí por partes.
class SchoolCatalogController extends Controller
{
    public const BUNDLED = 'database/data/catalogo-escuelas-2026.json.gz';

    // Palabras que no ayudan a buscar: "escuela forjadores de baja california" busca forjadores, baja y california.
    private const STOPWORDS = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'a', 'escuela', 'esc'];

    // Punto que la SEP pone cuando no sabe dónde está la escuela (el centro de Tijuana, en la Zona Río).
    // Lo traen 1,728 de las 2,155 escuelas de Tijuana del catálogo 2026, así que no es su ubicación.
    public const UNKNOWN_POINT = [32.497, -117.08];

    public const GEO_SOURCES = ['sep', 'inegi', 'aprox'];

    public static function knownPoint(mixed $lat, mixed $lng): bool
    {
        if ($lat === null || $lng === null || $lat === '' || $lng === '') {
            return false;
        }

        return ! (round((float) $lat, 4) === self::UNKNOWN_POINT[0] && round((float) $lng, 4) === self::UNKNOWN_POINT[1]);
    }

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
            'postal_code' => $s->postal_code !== '00000' ? $s->postal_code : null,
            'municipality' => $s->municipality,
            'lat' => $s->lat !== null ? (float) $s->lat : null,
            'lng' => $s->lng !== null ? (float) $s->lng : null,
            'geo' => $s->lat !== null ? ($s->geo ?? 'sep') : null,
            'registered' => in_array($s->cct, $taken, true),
        ])])->header('Cache-Control', 'no-store');
    }

    // Escuelas del catálogo con punto para ayudar a marcar el mapa del registro:
    // con lat y lng, las que están a menos de 1.5 km (la escuela toca la suya);
    // con cp, las de ese código postal (el registro pone el punto al centro de ellas).
    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lat' => ['required_without:cp', 'numeric', 'between:31.5,33.5'],
            'lng' => ['required_with:lat', 'numeric', 'between:-118,-115.5'],
            'cp' => ['nullable', 'string', 'regex:/^\d{5}$/', 'not_in:00000'],
        ]);
        $query = DB::table('school_catalog')->whereNotNull('lat')->whereNotNull('lng');
        if (isset($data['lat'])) {
            $lat = (float) $data['lat'];
            $lng = (float) $data['lng'];
            $query->whereBetween('lat', [$lat - 0.014, $lat + 0.014])->whereBetween('lng', [$lng - 0.016, $lng + 0.016]);
        } else {
            $query->where('postal_code', $data['cp']);
        }
        $rows = $query->limit(300)->get(['cct', 'name', 'level', 'colonia', 'postal_code', 'lat', 'lng']);
        if (isset($lat)) {
            // Distancia aproximada en metros (a esta escala basta un plano)
            $meters = fn ($s) => hypot(((float) $s->lat - $lat) * 111_000, ((float) $s->lng - $lng) * 94_000);
            $rows = $rows->filter(fn ($s) => $meters($s) <= 1500)->sortBy($meters)->take(60);
        }

        return response()->json(['schools' => $rows->values()->map(fn ($s) => [
            'cct' => $s->cct,
            'name' => $s->name,
            'level' => $s->level,
            'colonia' => $s->colonia,
            'postal_code' => $s->postal_code,
            'lat' => (float) $s->lat,
            'lng' => (float) $s->lng,
        ])]);
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
            'lat' => self::knownPoint($s['lat'] ?? null, $s['lng'] ?? null) ? $s['lat'] : null,
            'lng' => self::knownPoint($s['lat'] ?? null, $s['lng'] ?? null) ? $s['lng'] : null,
            'geo' => self::knownPoint($s['lat'] ?? null, $s['lng'] ?? null)
                ? (in_array($s['geo'] ?? null, self::GEO_SOURCES, true) ? $s['geo'] : 'sep')
                : null,
            'updated_at' => $now,
        ], $schools);
    }

    // Una escuela que llega sin punto (por ejemplo al actualizar desde datos.gob.mx, donde la SEP
    // no la ubica) conserva el que ya tenía, como los del INEGI.
    public static function save(array $rows): void
    {
        foreach ([true, false] as $withPoint) {
            $part = array_values(array_filter($rows, fn ($r) => ($r['lat'] !== null) === $withPoint));
            foreach (array_chunk($part, 500) as $chunk) {
                $skip = $withPoint ? ['cct' => true] : ['cct' => true, 'lat' => true, 'lng' => true, 'geo' => true];
                DB::table('school_catalog')->upsert($chunk, ['cct'], array_keys(array_diff_key($chunk[0], $skip)));
            }
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
