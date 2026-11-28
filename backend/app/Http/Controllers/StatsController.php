<?php

namespace App\Http\Controllers;

use App\Support\SchoolMunicipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

// Panel de datos para la administración y las cuentas de solo lectura.
// Solo cifras y nombres de escuelas: nunca nombres de alumnos.
class StatsController extends Controller
{
    private static function countBy(string $table, string $column, ?callable $where = null): Collection
    {
        $query = DB::table($table)->select($column, DB::raw('count(*) as total'))->groupBy($column);
        if ($where) {
            $where($query);
        }

        return $query->pluck('total', $column)->map(fn ($v) => (int) $v);
    }

    // Escuelas sin CCT (o que no están en el catálogo): el municipio sale de su ubicación en el mapa.
    private const SEATS = [
        'Tijuana' => [32.5149, -117.0382],
        'Playas de Rosarito' => [32.3615, -117.0554],
        'Tecate' => [32.5725, -116.6266],
        'Ensenada' => [31.8667, -116.5964],
        'Mexicali' => [32.6245, -115.4523],
        'San Quintín' => [30.5603, -115.9386],
        'San Felipe' => [31.0256, -114.837],
    ];

    public static function municipalityNear(mixed $lat, mixed $lng): string
    {
        if ($lat === null || $lng === null) {
            return 'Sin dato';
        }
        $best = 'Sin dato';
        $min = INF;
        foreach (self::SEATS as $name => [$y, $x]) {
            $d = (($lat - $y) * 111) ** 2 + (($lng - $x) * 94) ** 2;
            if ($d < $min) {
                [$min, $best] = [$d, $name];
            }
        }

        return $best;
    }

    public function index(Request $request): JsonResponse
    {
        // Con ?municipio= todo el panel se limita a las escuelas de ese municipio (y a sus docentes y alumnos)
        // Con desde y hasta, las actividades, puntos y Cimacoins cuentan solo esas fechas
        $data = $request->validate([
            'municipio' => ['nullable', 'string', 'max:60'],
            'desde' => ['nullable', 'date_format:Y-m-d'],
            'hasta' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
        ]);
        $from = isset($data['desde']) ? Carbon::parse($data['desde'])->startOfDay() : null;
        $to = isset($data['hasta']) ? Carbon::parse($data['hasta'])->endOfDay() : null;
        $dated = fn ($q, string $column = 'completions.completed_at') => $q->when($from, fn ($q) => $q->where($column, '>=', $from))->when($to, fn ($q) => $q->where($column, '<=', $to));
        $ids = ($data['municipio'] ?? null) ? SchoolMunicipality::idsIn($data['municipio']) : null;
        $teacherIds = $ids === null ? null : DB::table('teachers')->whereIn('school_id', $ids)->pluck('id')->all();
        $studentIds = $ids === null ? null : DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->whereIn('classrooms.teacher_id', $teacherIds)->pluck('students.id')->all();
        $only = fn ($q, string $column, ?array $list) => $list === null ? $q : $q->whereIn($column, $list);

        // Alumnos, docentes, grupos y actividades por escuela.
        $studentsBySchool = DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->whereNull('students.anonymized_at')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');
        $completionsBySchool = $dated(DB::table('completions'))
            ->join('students', 'students.id', '=', 'completions.student_id')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');
        // Última actividad de cada escuela (sin filtro de fechas), para ver cuáles están sin uso
        $lastBySchool = DB::table('completions')
            ->join('students', 'students.id', '=', 'completions.student_id')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->select('teachers.school_id', DB::raw('max(completions.completed_at) as last'))
            ->groupBy('teachers.school_id')->pluck('last', 'school_id');
        $teachersBySchool = self::countBy('teachers', 'school_id', fn ($q) => $q->where('active', true));
        $classroomsBySchool = DB::table('classrooms')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->whereNull('classrooms.archived_at')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');

        // El municipio sale del catálogo de la SEP por la CCT.
        $schools = DB::table('schools')
            ->leftJoin('school_catalog', 'school_catalog.cct', '=', 'schools.cct')
            ->orderBy('schools.name')
            ->get(['schools.id', 'schools.name', 'schools.cct', 'schools.colonia', 'schools.level', 'schools.sector', 'schools.status', 'schools.lat', 'schools.lng', 'schools.created_at', 'school_catalog.municipality'])
            ->map(fn ($s) => [
                'id' => (int) $s->id,
                'name' => $s->name,
                'cct' => $s->cct,
                'colonia' => mb_convert_case(trim($s->colonia), MB_CASE_TITLE),
                'municipality' => $s->municipality ?? self::municipalityNear($s->lat, $s->lng),
                'level' => $s->level,
                'sector' => $s->sector,
                'status' => $s->status,
                'lat' => $s->lat !== null ? (float) $s->lat : null,
                'lng' => $s->lng !== null ? (float) $s->lng : null,
                'last_activity' => isset($lastBySchool[$s->id]) ? Carbon::parse($lastBySchool[$s->id])->toDateString() : null,
                'teachers' => (int) ($teachersBySchool[$s->id] ?? 0),
                'classrooms' => (int) ($classroomsBySchool[$s->id] ?? 0),
                'students' => (int) ($studentsBySchool[$s->id] ?? 0),
                'completions' => (int) ($completionsBySchool[$s->id] ?? 0),
                'created_at' => $s->created_at,
            ]);
        if ($ids !== null) {
            $schools = $schools->whereIn('id', $ids)->values();
        }
        $approved = $schools->where('status', 'approved')->values();

        $group = fn (string $key) => $approved->groupBy($key)->map(fn ($g, $name) => [
            'name' => $name ?: 'Sin dato',
            'schools' => $g->count(),
            'teachers' => $g->sum('teachers'),
            'students' => $g->sum('students'),
            'completions' => $g->sum('completions'),
        ])->sortByDesc(fn ($r) => [$r['students'], $r['schools']])->values();

        $activities = DB::table('activities')
            ->leftJoin('completions', fn ($j) => $dated($only($j->on('completions.activity_id', '=', 'activities.id'), 'completions.student_id', $studentIds)))
            ->where('activities.active', true)
            ->groupBy('activities.id', 'activities.key', 'activities.title')
            ->orderByDesc(DB::raw('count(completions.id)'))->orderBy('activities.title')
            ->get(['activities.key', 'activities.title', DB::raw('count(completions.id) as total')])
            ->map(fn ($a) => ['key' => $a->key, 'title' => $a->title, 'completions' => (int) $a->total]);

        // Crecimiento por semana: escuelas, alumnos y actividades nuevas. Sin fechas, las últimas 8 semanas.
        // Con fechas, las semanas del rango (hasta 26).
        $until = $to ?? now()->endOfDay();
        $since = ($from ?? $until->copy()->startOfWeek()->subWeeks(7))->copy()->startOfWeek();
        if ($since->diffInWeeks($until) > 26) {
            $since = $until->copy()->startOfWeek()->subWeeks(25);
        }
        $weeks = [];
        for ($w = $since->copy(); $w <= $until; $w->addWeek()) {
            $weeks[$w->toDateString()] = ['schools' => 0, 'students' => 0, 'completions' => 0];
        }
        $bucket = function (string $table, string $column, string $field, ?string $key = null, ?array $list = null) use (&$weeks, $since, $only): void {
            $only(DB::table($table), $key ?? 'id', $key ? $list : null)->where($column, '>=', $since)->pluck($column)->each(function ($at) use (&$weeks, $field): void {
                $key = Carbon::parse($at)->startOfWeek()->toDateString();
                if (isset($weeks[$key])) {
                    $weeks[$key][$field]++;
                }
            });
        };
        $bucket('schools', 'created_at', 'schools', $ids === null ? null : 'id', $ids);
        $bucket('students', 'created_at', 'students', $ids === null ? null : 'id', $studentIds);
        $bucket('completions', 'completed_at', 'completions', $ids === null ? null : 'student_id', $studentIds);

        $statusCounts = self::countBy('schools', 'status', fn ($q) => $only($q, 'id', $ids));
        $completions = fn () => $dated($only(DB::table('completions'), 'student_id', $studentIds), 'completed_at');

        return response()->json([
            'totals' => [
                'schools' => (int) ($statusCounts['approved'] ?? 0),
                'suspended_schools' => (int) ($statusCounts['suspended'] ?? 0),
                'teachers' => $only(DB::table('teachers'), 'school_id', $ids)->where('active', true)->count(),
                'classrooms' => $only(DB::table('classrooms'), 'teacher_id', $teacherIds)->whereNull('archived_at')->count(),
                'students' => $only(DB::table('students'), 'id', $studentIds)->whereNull('anonymized_at')->count(),
                'active_students' => $only(DB::table('device_sessions'), 'owner_id', $studentIds)->where('kind', 'student')->where('last_used_on', '>=', now()->subDays(7)->toDateString())->distinct()->count('owner_id'),
                'completions' => $completions()->count(),
                'points' => (int) $completions()->sum('points'),
                // Cimacoins ganadas por todos los alumnos (sin las 150 iniciales ni lo gastado)
                'coins_earned' => (int) $completions()->sum('points') * (int) config('avatar.per_point')
                    + $only(DB::table('students'), 'id', $studentIds)->whereNotNull('wallet')->pluck('wallet')
                        ->sum(fn ($w) => max(0, (int) ((is_string($w) ? json_decode($w, true) : $w)['bonus'] ?? 0))),
                'catalog' => DB::table('school_catalog')->count(),
            ],
            'schools' => $approved->map(fn ($s) => collect($s)->except('created_at')->all())->values(),
            'desde' => $data['desde'] ?? null,
            'hasta' => $data['hasta'] ?? null,
            'municipio' => $ids === null ? null : (SchoolCatalogController::municipalityName($data['municipio']) ?? $data['municipio']),
            'municipalities' => $group('municipality'),
            'colonias' => $group('colonia'),
            'levels' => $group('level'),
            'sectors' => $group('sector'),
            'activities' => $activities,
            'weeks' => collect($weeks)->map(fn ($v, $week) => ['week' => $week] + $v)->values(),
        ])->header('Cache-Control', 'no-store');
    }
}
