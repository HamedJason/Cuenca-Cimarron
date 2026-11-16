<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
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

    public function index(): JsonResponse
    {
        // Alumnos, docentes, grupos y actividades por escuela.
        $studentsBySchool = DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->whereNull('students.anonymized_at')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');
        $completionsBySchool = DB::table('completions')
            ->join('students', 'students.id', '=', 'completions.student_id')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');
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
                'municipality' => $s->municipality ?? 'Sin dato',
                'level' => $s->level,
                'sector' => $s->sector,
                'status' => $s->status,
                'lat' => $s->lat !== null ? (float) $s->lat : null,
                'lng' => $s->lng !== null ? (float) $s->lng : null,
                'teachers' => (int) ($teachersBySchool[$s->id] ?? 0),
                'classrooms' => (int) ($classroomsBySchool[$s->id] ?? 0),
                'students' => (int) ($studentsBySchool[$s->id] ?? 0),
                'completions' => (int) ($completionsBySchool[$s->id] ?? 0),
                'created_at' => $s->created_at,
            ]);
        $approved = $schools->where('status', 'approved')->values();

        $group = fn (string $key) => $approved->groupBy($key)->map(fn ($g, $name) => [
            'name' => $name ?: 'Sin dato',
            'schools' => $g->count(),
            'teachers' => $g->sum('teachers'),
            'students' => $g->sum('students'),
            'completions' => $g->sum('completions'),
        ])->sortByDesc(fn ($r) => [$r['students'], $r['schools']])->values();

        $activities = DB::table('activities')
            ->leftJoin('completions', 'completions.activity_id', '=', 'activities.id')
            ->where('activities.active', true)
            ->groupBy('activities.id', 'activities.key', 'activities.title')
            ->orderByDesc(DB::raw('count(completions.id)'))->orderBy('activities.title')
            ->get(['activities.key', 'activities.title', DB::raw('count(completions.id) as total')])
            ->map(fn ($a) => ['key' => $a->key, 'title' => $a->title, 'completions' => (int) $a->total]);

        // Crecimiento de las últimas 8 semanas: escuelas, alumnos y actividades nuevas.
        $since = now()->startOfWeek()->subWeeks(7);
        $weeks = [];
        for ($i = 0; $i < 8; $i++) {
            $weeks[$since->copy()->addWeeks($i)->toDateString()] = ['schools' => 0, 'students' => 0, 'completions' => 0];
        }
        $bucket = function (string $table, string $column, string $field) use (&$weeks, $since): void {
            DB::table($table)->where($column, '>=', $since)->pluck($column)->each(function ($at) use (&$weeks, $field): void {
                $key = Carbon::parse($at)->startOfWeek()->toDateString();
                if (isset($weeks[$key])) {
                    $weeks[$key][$field]++;
                }
            });
        };
        $bucket('schools', 'created_at', 'schools');
        $bucket('students', 'created_at', 'students');
        $bucket('completions', 'completed_at', 'completions');

        $statusCounts = self::countBy('schools', 'status');

        return response()->json([
            'totals' => [
                'schools' => (int) ($statusCounts['approved'] ?? 0),
                'pending_schools' => (int) ($statusCounts['pending'] ?? 0),
                'teachers' => DB::table('teachers')->where('active', true)->count(),
                'classrooms' => DB::table('classrooms')->whereNull('archived_at')->count(),
                'students' => DB::table('students')->whereNull('anonymized_at')->count(),
                'active_students' => DB::table('device_sessions')->where('kind', 'student')->where('last_used_on', '>=', now()->subDays(7)->toDateString())->distinct()->count('owner_id'),
                'completions' => DB::table('completions')->count(),
                'points' => (int) DB::table('completions')->sum('points'),
                'catalog' => DB::table('school_catalog')->count(),
            ],
            'schools' => $approved->map(fn ($s) => collect($s)->except('created_at')->all())->values(),
            'municipalities' => $group('municipality'),
            'colonias' => $group('colonia'),
            'levels' => $group('level'),
            'sectors' => $group('sector'),
            'activities' => $activities,
            'weeks' => collect($weeks)->map(fn ($v, $week) => ['week' => $week] + $v)->values(),
        ])->header('Cache-Control', 'no-store');
    }
}
