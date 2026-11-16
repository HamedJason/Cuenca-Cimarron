<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// Estadísticas para la administración. Solo cifras: nunca nombres de alumnos.
class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $studentsBySchool = DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');
        $completionsBySchool = DB::table('completions')
            ->join('students', 'students.id', '=', 'completions.student_id')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->select('teachers.school_id', DB::raw('count(*) as total'))
            ->groupBy('teachers.school_id')->pluck('total', 'school_id');

        $schools = DB::table('schools')->where('status', 'approved')->orderBy('name')
            ->get(['id', 'name', 'colonia', 'level', 'lat', 'lng'])
            ->map(fn ($s) => [
                'id' => (int) $s->id,
                'name' => $s->name,
                'colonia' => $s->colonia,
                'level' => $s->level,
                'lat' => $s->lat !== null ? (float) $s->lat : null,
                'lng' => $s->lng !== null ? (float) $s->lng : null,
                'students' => (int) ($studentsBySchool[$s->id] ?? 0),
                'completions' => (int) ($completionsBySchool[$s->id] ?? 0),
            ]);

        $colonias = $schools->groupBy(fn ($s) => mb_convert_case(trim($s['colonia']), MB_CASE_TITLE))
            ->map(fn ($group, $colonia) => [
                'colonia' => $colonia,
                'schools' => $group->count(),
                'students' => $group->sum('students'),
            ])->sortByDesc('students')->values();

        $activities = DB::table('activities')
            ->leftJoin('completions', 'completions.activity_id', '=', 'activities.id')
            ->where('activities.active', true)
            ->groupBy('activities.id', 'activities.key', 'activities.title')
            ->orderByDesc(DB::raw('count(completions.id)'))->orderBy('activities.title')
            ->get(['activities.key', 'activities.title', DB::raw('count(completions.id) as total')])
            ->map(fn ($a) => ['key' => $a->key, 'title' => $a->title, 'completions' => (int) $a->total]);

        // Actividades completadas por semana, las últimas 8 semanas.
        $since = now()->startOfWeek()->subWeeks(7);
        $weeks = [];
        for ($i = 0; $i < 8; $i++) {
            $weeks[$since->copy()->addWeeks($i)->toDateString()] = 0;
        }
        DB::table('completions')->where('completed_at', '>=', $since)->pluck('completed_at')
            ->each(function ($at) use (&$weeks): void {
                $key = Carbon::parse($at)->startOfWeek()->toDateString();
                if (isset($weeks[$key])) {
                    $weeks[$key]++;
                }
            });

        return response()->json([
            'totals' => [
                'schools' => $schools->count(),
                'pending_schools' => DB::table('schools')->where('status', 'pending')->count(),
                'teachers' => DB::table('teachers')->where('active', true)->count(),
                'classrooms' => DB::table('classrooms')->whereNull('archived_at')->count(),
                'students' => DB::table('students')->count(),
                'completions' => DB::table('completions')->count(),
                'points' => (int) DB::table('completions')->sum('points'),
            ],
            'schools' => $schools->values(),
            'colonias' => $colonias,
            'activities' => $activities,
            'weeks' => collect($weeks)->map(fn ($total, $week) => ['week' => $week, 'completions' => $total])->values(),
        ])->header('Cache-Control', 'no-store');
    }
}
