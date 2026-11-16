<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

// Tareas: el docente elige actividades del catálogo para un grupo y ve el avance de cada alumno.
class AssignmentController extends Controller
{
    private function classroomOf(Request $request, Classroom $classroom): Classroom
    {
        abort_unless($classroom->teacher_id === $request->attributes->get('teacher')->id, 404);

        return $classroom;
    }

    public static function assigned(int $classroomId): array
    {
        return DB::table('assignments')
            ->join('activities', 'activities.id', '=', 'assignments.activity_id')
            ->where('assignments.classroom_id', $classroomId)
            ->where('activities.active', true)
            ->orderBy('activities.sort')
            ->get(['activities.id', 'activities.key', 'activities.title', 'activities.points', 'activities.route', 'assignments.due_date'])
            ->map(fn ($a) => [
                'id' => (int) $a->id,
                'key' => $a->key,
                'title' => $a->title,
                'points' => (int) $a->points,
                'route' => $a->route,
                'due_date' => $a->due_date ? substr((string) $a->due_date, 0, 10) : null,
            ])->all();
    }

    public function index(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);

        return response()->json(['tasks' => self::assigned($classroom->id), 'catalog' => ActivityController::catalog()]);
    }

    public function store(Request $request, Classroom $classroom): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $data = $request->validate([
            'activities' => ['required', 'array', 'min:1', 'max:30'],
            'activities.*' => ['string', Rule::exists('activities', 'key')->where('active', true)],
            'due_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:today'],
        ]);
        $ids = DB::table('activities')->whereIn('key', $data['activities'])->pluck('id');
        foreach ($ids as $id) {
            DB::table('assignments')->updateOrInsert(
                ['classroom_id' => $classroom->id, 'activity_id' => $id],
                ['due_date' => $data['due_date'] ?? null, 'created_at' => now()],
            );
        }
        Audit::log('teacher', $classroom->teacher_id, 'asignar-tareas', 'classroom', $classroom->id, ['actividades' => $data['activities']]);

        return response()->json(['tasks' => self::assigned($classroom->id)]);
    }

    public function destroy(Request $request, Classroom $classroom, string $key): JsonResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $id = DB::table('activities')->where('key', $key)->value('id');
        DB::table('assignments')->where('classroom_id', $classroom->id)->where('activity_id', $id)->delete();

        return response()->json(['tasks' => self::assigned($classroom->id)]);
    }

    // Tabla de avance: alumnos en filas, tareas en columnas y el total de puntos.
    public static function progressTable(Classroom $classroom): array
    {
        $tasks = self::assigned($classroom->id);
        $students = DB::table('students')->where('classroom_id', $classroom->id)->whereNull('anonymized_at')->orderBy('name')->get(['id', 'name']);
        $completions = DB::table('completions')->whereIn('student_id', $students->pluck('id'))->get(['student_id', 'activity_id', 'points']);
        $byStudent = $completions->groupBy('student_id');

        return [
            'tasks' => $tasks,
            'students' => $students->map(function ($s) use ($byStudent, $tasks) {
                $mine = $byStudent->get($s->id, collect());
                $done = $mine->pluck('activity_id')->all();

                return [
                    'id' => (int) $s->id,
                    'name' => $s->name,
                    'done' => array_values(array_map(fn ($t) => $t['key'], array_filter($tasks, fn ($t) => in_array($t['id'], $done)))),
                    'tasks_done' => count(array_filter($tasks, fn ($t) => in_array($t['id'], $done))),
                    'points' => (int) $mine->sum('points'),
                ];
            })->values()->all(),
        ];
    }

    public function progress(Request $request, Classroom $classroom): JsonResponse
    {
        return response()->json(self::progressTable($this->classroomOf($request, $classroom)));
    }

    public function csv(Request $request, Classroom $classroom): StreamedResponse
    {
        $classroom = $this->classroomOf($request, $classroom);
        $table = self::progressTable($classroom);
        $name = 'avance-'.preg_replace('/[^a-z0-9]+/', '-', strtolower(\Illuminate\Support\Str::ascii($classroom->name))).'.csv';

        return response()->streamDownload(function () use ($table): void {
            $out = fopen('php://output', 'w');
            // Marca BOM para que Excel abra bien los acentos.
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, array_merge(['Alumno'], array_map(fn ($t) => $t['title'], $table['tasks']), ['Tareas hechas', 'Puntos']));
            foreach ($table['students'] as $s) {
                $row = [self::safeCell($s['name'])];
                foreach ($table['tasks'] as $t) {
                    $row[] = in_array($t['key'], $s['done'], true) ? 'Sí' : 'No';
                }
                $row[] = $s['tasks_done'].' de '.count($table['tasks']);
                $row[] = $s['points'];
                fputcsv($out, $row);
            }
            fclose($out);
        }, $name, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // Evita que una hoja de cálculo interprete un nombre como fórmula.
    private static function safeCell(string $value): string
    {
        return preg_match('/^[=+\-@]/', $value) ? "'".$value : $value;
    }

    // Tareas del alumno, para su lista flotante.
    public static function forStudent(int $studentId, int $classroomId): array
    {
        $done = DB::table('completions')->where('student_id', $studentId)->pluck('activity_id')->all();

        return array_map(fn ($t) => [
            'key' => $t['key'],
            'title' => $t['title'],
            'points' => $t['points'],
            'route' => $t['route'],
            'due_date' => $t['due_date'],
            'done' => in_array($t['id'], $done),
        ], self::assigned($classroomId));
    }
}
