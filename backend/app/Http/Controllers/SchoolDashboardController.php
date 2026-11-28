<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Teacher;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

// Panel de la escuela: cómo van sus docentes, sus grupos y sus alumnos. Todo se limita a la escuela
// de la cuenta que entra (rol:school,aprobada), así que nunca ve datos de otra escuela.
// Las actividades y Cimacoins cuentan solo las fechas elegidas (desde, hasta).
class SchoolDashboardController extends Controller
{
    // Fechas del filtro y los ids de docentes, grupos y alumnos de la escuela
    private function scope(Request $request): array
    {
        $data = $request->validate([
            'desde' => ['nullable', 'date_format:Y-m-d'],
            'hasta' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
        ]);
        $school = $request->user()->school;
        $teachers = Teacher::where('school_id', $school->id)->orderByDesc('active')->orderBy('name')->get(['id', 'name', 'active']);
        $classrooms = DB::table('classrooms')->whereIn('teacher_id', $teachers->pluck('id'))->whereNull('archived_at')
            ->orderBy('grade')->orderBy('name')->get(['id', 'name', 'grade', 'teacher_id', 'open', 'code']);
        $students = DB::table('students')->whereIn('classroom_id', $classrooms->pluck('id'))->whereNull('anonymized_at')
            ->get(['id', 'classroom_id', 'wallet', 'created_at']);

        return [
            'school' => $school,
            'from' => isset($data['desde']) ? Carbon::parse($data['desde'])->startOfDay() : null,
            'to' => isset($data['hasta']) ? Carbon::parse($data['hasta'])->endOfDay() : null,
            'desde' => $data['desde'] ?? null,
            'hasta' => $data['hasta'] ?? null,
            'teachers' => $teachers,
            'classrooms' => $classrooms,
            'students' => $students,
        ];
    }

    private function completions(array $s)
    {
        return DB::table('completions')->whereIn('student_id', $s['students']->pluck('id'))
            ->when($s['from'], fn ($q) => $q->where('completed_at', '>=', $s['from']))
            ->when($s['to'], fn ($q) => $q->where('completed_at', '<=', $s['to']));
    }

    // Una fila por grupo y por docente con alumnos, actividades, Cimacoins y última actividad
    private function rows(array $s): array
    {
        $perPoint = (int) config('avatar.per_point');
        $classOf = $s['students']->pluck('classroom_id', 'id');
        $byClass = [];
        foreach ($this->completions($s)->get(['student_id', 'points', 'completed_at']) as $c) {
            $id = $classOf[$c->student_id] ?? null;
            if ($id === null) {
                continue;
            }
            $byClass[$id]['n'] = ($byClass[$id]['n'] ?? 0) + 1;
            $byClass[$id]['p'] = ($byClass[$id]['p'] ?? 0) + (int) $c->points;
            $at = Carbon::parse($c->completed_at)->toDateString();
            $byClass[$id]['last'] = max($byClass[$id]['last'] ?? '', $at);
        }
        $studentsOf = $s['students']->countBy('classroom_id');
        $names = $s['teachers']->pluck('name', 'id');
        $classrooms = $s['classrooms']->map(fn ($c) => [
            'id' => (int) $c->id,
            'name' => $c->name,
            'grade' => $c->grade,
            'teacher' => $names[$c->teacher_id] ?? '',
            'teacher_id' => (int) $c->teacher_id,
            'open' => (bool) $c->open,
            // Código del grupo para que los alumnos entren (solo en pantalla, no va en las descargas)
            'code' => $c->code,
            'students' => (int) ($studentsOf[$c->id] ?? 0),
            'completions' => (int) ($byClass[$c->id]['n'] ?? 0),
            'coins' => (int) ($byClass[$c->id]['p'] ?? 0) * $perPoint,
            'last_activity' => $byClass[$c->id]['last'] ?? null,
        ])->values();
        $teachers = $s['teachers']->map(function ($t) use ($classrooms) {
            $mine = $classrooms->where('teacher_id', $t->id);

            return [
                'id' => (int) $t->id,
                'name' => $t->name,
                'active' => (bool) $t->active,
                'classrooms' => $mine->count(),
                'students' => $mine->sum('students'),
                'completions' => $mine->sum('completions'),
                'last_activity' => $mine->pluck('last_activity')->filter()->max(),
            ];
        })->values();

        return [$teachers, $classrooms];
    }

    private function activities(array $s): array
    {
        return $this->completions($s)
            ->join('activities', 'activities.id', '=', 'completions.activity_id')
            ->select('activities.title', 'activities.kind', DB::raw('count(*) as total'))
            ->groupBy('activities.id', 'activities.title', 'activities.kind')
            ->orderByDesc('total')->orderBy('activities.title')->get()
            ->map(fn ($a) => ['title' => $a->title, 'kind' => $a->kind, 'completions' => (int) $a->total])->all();
    }

    // Semanas: sin fechas, las últimas 8. Con fechas, las del rango (hasta 26).
    private function weeks(array $s): array
    {
        $to = $s['to'] ?? now()->endOfDay();
        $from = $s['from'] ?? $to->copy()->startOfWeek()->subWeeks(7);
        $start = $from->copy()->startOfWeek();
        if ($start->diffInWeeks($to) > 26) {
            $start = $to->copy()->startOfWeek()->subWeeks(25);
        }
        $weeks = [];
        for ($w = $start->copy(); $w <= $to; $w->addWeek()) {
            $weeks[$w->toDateString()] = ['week' => $w->toDateString(), 'students' => 0, 'completions' => 0];
        }
        $add = function ($at, string $field) use (&$weeks): void {
            $k = Carbon::parse($at)->startOfWeek()->toDateString();
            if (isset($weeks[$k])) {
                $weeks[$k][$field]++;
            }
        };
        foreach ($s['students'] as $st) {
            $add($st->created_at, 'students');
        }
        $all = array_merge($s, ['from' => $start, 'to' => $to]);
        foreach ($this->completions($all)->pluck('completed_at') as $at) {
            $add($at, 'completions');
        }

        return array_values($weeks);
    }

    public function index(Request $request): JsonResponse
    {
        $s = $this->scope($request);
        [$teachers, $classrooms] = $this->rows($s);
        $active = DB::table('device_sessions')->where('kind', 'student')->whereIn('owner_id', $s['students']->pluck('id'))
            ->where('last_used_on', '>=', now()->subDays(7)->toDateString())->distinct()->count('owner_id');

        return response()->json([
            'totals' => [
                'teachers' => $s['teachers']->where('active', true)->count(),
                'classrooms' => $classrooms->count(),
                'students' => $s['students']->count(),
                'active_students' => $active,
                'completions' => $classrooms->sum('completions'),
                'coins' => $classrooms->sum('coins'),
            ],
            'teachers' => $teachers,
            'classrooms' => $classrooms,
            'activities' => $this->activities($s),
            'weeks' => $this->weeks($s),
        ])->header('Cache-Control', 'no-store');
    }

    // El grupo tiene que ser de un docente de esta escuela. Si no, no existe.
    private function classroomOf(Request $request, Classroom $classroom): Classroom
    {
        abort_unless(Teacher::where('id', $classroom->teacher_id)->where('school_id', $request->user()->school->id)->exists(), 404);

        return $classroom;
    }

    // Avance por alumno de un grupo, igual que lo ve el docente
    public function progress(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);

        return response()->json(AssignmentController::progressTable($classroom) + [
            'classroom' => ['id' => $classroom->id, 'name' => $classroom->name, 'grade' => $classroom->grade],
        ])->header('Cache-Control', 'no-store');
    }

    public function progressCsv(Request $request, Classroom $classroom): StreamedResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $table = AssignmentController::progressTable($classroom);
        Audit::log('school', $request->user()->id, 'exportar-avance-grupo', 'classroom', $classroom->id);
        $rows = [array_merge(['Alumno'], array_map(fn ($t) => $t['title'], $table['tasks']), ['Tareas hechas', 'Cimacoins ganadas'])];
        foreach ($table['students'] as $st) {
            $row = [$st['name']];
            foreach ($table['tasks'] as $t) {
                $row[] = in_array($t['key'], $st['done'], true) ? 'Sí' : 'No';
            }
            $rows[] = [...$row, $st['tasks_done'].' de '.count($table['tasks']), $st['coins_earned']];
        }

        return self::csv($rows, 'avance-'.Str::slug($classroom->name).'.csv');
    }

    // Descargas de la escuela: docentes, grupos y actividades (sin nombres de alumnos)
    public function export(Request $request, string $tipo): StreamedResponse
    {
        abort_unless(in_array($tipo, ['docentes', 'grupos', 'actividades'], true), 404);
        $s = $this->scope($request);
        [$teachers, $classrooms] = $this->rows($s);
        $rows = match ($tipo) {
            'docentes' => [['Docente', 'Estado', 'Grupos', 'Alumnos', 'Actividades completadas', 'Última actividad'],
                ...$teachers->map(fn ($t) => [$t['name'], $t['active'] ? 'Activo' : 'Dado de baja', $t['classrooms'], $t['students'], $t['completions'], $t['last_activity'] ?? ''])->all()],
            'grupos' => [['Grupo', 'Grado', 'Docente', 'Alumnos', 'Actividades completadas', 'Cimacoins ganadas', 'Última actividad'],
                ...$classrooms->map(fn ($c) => [$c['name'], $c['grade'] ?? '', $c['teacher'], $c['students'], $c['completions'], $c['coins'], $c['last_activity'] ?? ''])->all()],
            'actividades' => [['Actividad', 'Tipo', 'Veces completada'],
                ...array_map(fn ($a) => [$a['title'], $a['kind'], $a['completions']], $this->activities($s))],
        };
        Audit::log('school', $request->user()->id, 'exportar-datos-escuela', null, null, array_filter(['archivo' => $tipo, 'desde' => $s['desde'], 'hasta' => $s['hasta']]));

        return self::csv($rows, implode('-', array_filter(['escuela', $tipo, $s['desde'], $s['hasta']])).'.csv');
    }

    // CSV para Excel: UTF-8 con BOM, comas, y sin fórmulas en las celdas
    private static function csv(array $rows, string $name): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($out, array_map(fn ($v) => is_string($v) && preg_match('/^[=+\-@]/', $v) ? "'".$v : $v, $row), ',', '"', '');
            }
            fclose($out);
        }, $name, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }
}
