<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

// Desde dónde nos visitan. El navegador manda solo el municipio y la zona aproximada
// (nunca coordenadas) y aquí se suma 1 al contador de ese día. No se guarda la IP ni nada
// que identifique a la persona.
class VisitZoneController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'municipio' => ['required', 'string', Rule::in(config('zonas.municipios'))],
            'zona' => ['required', 'string', 'max:60'],
            // La fecha del navegador solo se revisa; se guarda la del servidor.
            'fecha' => ['nullable', 'date'],
        ]);
        $valid = $data['municipio'] === 'Tijuana'
            ? in_array($data['zona'], config('zonas.tijuana'), true)
            : $data['zona'] === $data['municipio'];
        if (! $valid) {
            return response()->json(['message' => 'Esa zona no existe.'], 422);
        }

        self::count($data['municipio'], $data['zona']);

        return response()->json(['ok' => true]);
    }

    public static function count(string $municipio, string $zona, int $visits = 1, ?string $day = null): void
    {
        $key = ['day' => $day ?? now()->toDateString(), 'municipio' => $municipio, 'zona' => $zona];
        DB::transaction(function () use ($key, $visits): void {
            DB::table('visit_zones')->insertOrIgnore($key + ['visits' => 0]);
            DB::table('visit_zones')->where($key)->increment('visits', $visits);
        });
    }

    // Panel de administración: visitas por municipio y por delegación de Tijuana.
    public function index(): JsonResponse
    {
        $rows = fn (string $column, ?string $municipio = null) => DB::table('visit_zones')
            ->when($municipio, fn ($q) => $q->where('municipio', $municipio))
            ->select($column.' as name', DB::raw('sum(visits) as visits'))
            ->groupBy($column)->orderByDesc('visits')->orderBy('name')->get()
            ->map(fn ($r) => ['name' => $r->name, 'visits' => (int) $r->visits]);

        return response()->json([
            'total' => (int) DB::table('visit_zones')->sum('visits'),
            'municipios' => $rows('municipio'),
            'tijuana' => $rows('zona', 'Tijuana'),
        ]);
    }
}
