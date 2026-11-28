<?php

namespace App\Http\Controllers;

use App\Support\Audit;
use App\Support\SchoolMunicipality;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

// Descarga de datos del panel en CSV para Excel (UTF-8 con BOM, separado por comas).
// Solo cifras por escuela, municipio, actividad, semana y zona. Nunca nombres de alumnos, códigos,
// correos ni contraseñas. Cada descarga queda en la bitácora.
class ExportController extends Controller
{
    public const TYPES = ['escuelas', 'municipios', 'actividades', 'semanas', 'visitas', 'opiniones'];

    public function download(Request $request, string $tipo): StreamedResponse
    {
        abort_unless(in_array($tipo, self::TYPES, true), 404);
        $data = $request->validate([
            'municipio' => ['nullable', 'string', Rule::in([...SchoolCatalogController::municipalities(), ...array_keys(config('zonas.catalogo'))])],
            'desde' => ['nullable', 'date_format:Y-m-d'],
            'hasta' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
        ]);
        $municipio = isset($data['municipio']) ? SchoolCatalogController::municipalityName($data['municipio']) : null;
        $from = isset($data['desde']) ? Carbon::parse($data['desde'])->startOfDay() : null;
        $to = isset($data['hasta']) ? Carbon::parse($data['hasta'])->endOfDay() : null;

        $rows = $this->{$tipo}($municipio, $from, $to);
        Audit::log('admin', $request->user()->id, 'exportar-datos', null, null, array_filter([
            'archivo' => $tipo, 'municipio' => $municipio, 'desde' => $data['desde'] ?? null, 'hasta' => $data['hasta'] ?? null,
        ]));

        $name = implode('-', array_filter(['cuenca-cimarrona', $tipo, $municipio ? Str::slug($municipio) : null, $data['desde'] ?? null, $data['hasta'] ?? null])).'.csv';

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                // Una celda que empieza con = + - @ se abriría como fórmula en Excel
                fputcsv($out, array_map(fn ($v) => is_string($v) && preg_match('/^[=+\-@]/', $v) ? "'".$v : $v, $row), ',', '"', '');
            }
            fclose($out);
        }, $name, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    // Escuela de cada alumno, para sumar sus cifras
    private function studentSchools(): array
    {
        return DB::table('students')
            ->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')
            ->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->pluck('teachers.school_id', 'students.id')->map(fn ($v) => (int) $v)->all();
    }

    private function completions(?Carbon $from, ?Carbon $to)
    {
        return DB::table('completions')
            ->when($from, fn ($q) => $q->where('completed_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('completed_at', '<=', $to));
    }

    // Escuelas: una fila por escuela. Las actividades y Cimacoins cuentan solo las fechas elegidas.
    private function escuelas(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $where = SchoolMunicipality::all();
        $bySchool = $this->studentSchools();
        $done = [];
        $points = [];
        foreach ($this->completions($from, $to)->get(['student_id', 'points']) as $c) {
            $school = $bySchool[$c->student_id] ?? null;
            if ($school === null) {
                continue;
            }
            $done[$school] = ($done[$school] ?? 0) + 1;
            $points[$school] = ($points[$school] ?? 0) + (int) $c->points;
        }
        $teachers = DB::table('teachers')->where('active', true)->select('school_id', DB::raw('count(*) as n'))->groupBy('school_id')->pluck('n', 'school_id');
        $classrooms = DB::table('classrooms')->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')->whereNull('classrooms.archived_at')
            ->select('teachers.school_id', DB::raw('count(*) as n'))->groupBy('teachers.school_id')->pluck('n', 'school_id');
        $students = DB::table('students')->join('classrooms', 'classrooms.id', '=', 'students.classroom_id')->join('teachers', 'teachers.id', '=', 'classrooms.teacher_id')
            ->whereNull('students.anonymized_at')->select('teachers.school_id', DB::raw('count(*) as n'))->groupBy('teachers.school_id')->pluck('n', 'school_id');
        $perPoint = (int) config('avatar.per_point');
        $rows = [['Escuela', 'CCT', 'Municipio', 'Nivel', 'Colonia', 'Estado', 'Fecha de registro', 'Docentes', 'Grupos', 'Alumnos', 'Actividades completadas', 'Cimacoins ganadas']];
        $schools = DB::table('schools')->orderBy('name')->get(['id', 'name', 'cct', 'level', 'colonia', 'status', 'created_at']);
        foreach ($schools as $s) {
            $m = $where[$s->id] ?? 'Sin dato';
            if ($municipio && $m !== $municipio) {
                continue;
            }
            $rows[] = [
                $s->name, $s->cct ?? '', $m, $s->level ?? '', $s->colonia ?? '',
                $s->status === 'suspended' ? 'Suspendida' : 'Registrada',
                $s->created_at ? Carbon::parse($s->created_at)->toDateString() : '',
                (int) ($teachers[$s->id] ?? 0), (int) ($classrooms[$s->id] ?? 0), (int) ($students[$s->id] ?? 0),
                (int) ($done[$s->id] ?? 0), (int) ($points[$s->id] ?? 0) * $perPoint,
            ];
        }

        return $rows;
    }

    // Resumen por municipio, sumando las filas de escuelas
    private function municipios(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $sum = [];
        foreach (array_slice($this->escuelas($municipio, $from, $to), 1) as $r) {
            $k = $r[2];
            $sum[$k] ??= [$k, 0, 0, 0, 0, 0, 0, 0];
            $sum[$k][$r[5] === 'Suspendida' ? 2 : 1]++;
            foreach ([3 => 7, 4 => 8, 5 => 9, 6 => 10, 7 => 11] as $col => $src) {
                $sum[$k][$col] += $r[$src];
            }
        }
        ksort($sum);

        return [['Municipio', 'Escuelas registradas', 'Escuelas suspendidas', 'Docentes', 'Grupos', 'Alumnos', 'Actividades completadas', 'Cimacoins ganadas'], ...array_values($sum)];
    }

    // Actividades: cuántas veces se completó cada lectura o juego, por municipio
    private function actividades(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $where = SchoolMunicipality::all();
        $bySchool = $this->studentSchools();
        $activities = DB::table('activities')->get(['id', 'title', 'kind'])->keyBy('id');
        $count = [];
        foreach ($this->completions($from, $to)->get(['student_id', 'activity_id']) as $c) {
            $m = $where[$bySchool[$c->student_id] ?? 0] ?? 'Sin dato';
            if ($municipio && $m !== $municipio) {
                continue;
            }
            $count[$m.'|'.$c->activity_id] = ($count[$m.'|'.$c->activity_id] ?? 0) + 1;
        }
        $rows = [];
        foreach ($count as $key => $n) {
            [$m, $id] = explode('|', $key);
            $a = $activities[(int) $id] ?? null;
            $rows[] = [$m, $a->title ?? 'Actividad '.$id, $a->kind ?? '', $n];
        }
        usort($rows, fn ($a, $b) => [$a[0], -$a[3]] <=> [$b[0], -$b[3]]);

        return [['Municipio', 'Actividad', 'Tipo', 'Veces completada'], ...$rows];
    }

    // Crecimiento por semana: escuelas nuevas, alumnos nuevos y actividades completadas.
    // Sin fechas, las últimas 12 semanas.
    private function semanas(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $to ??= now()->endOfDay();
        $from ??= $to->copy()->startOfWeek()->subWeeks(11);
        $where = SchoolMunicipality::all();
        $bySchool = $this->studentSchools();
        $in = fn ($schoolId) => ! $municipio || ($where[$schoolId] ?? 'Sin dato') === $municipio;
        $weeks = [];
        for ($w = $from->copy()->startOfWeek(); $w <= $to; $w->addWeek()) {
            $weeks[$w->toDateString()] = [$w->toDateString(), 0, 0, 0];
        }
        $add = function ($at, int $col) use (&$weeks): void {
            $k = Carbon::parse($at)->startOfWeek()->toDateString();
            if (isset($weeks[$k])) {
                $weeks[$k][$col]++;
            }
        };
        foreach (DB::table('schools')->whereBetween('created_at', [$from, $to])->get(['id', 'created_at']) as $s) {
            if ($in($s->id)) {
                $add($s->created_at, 1);
            }
        }
        foreach (DB::table('students')->whereBetween('created_at', [$from, $to])->get(['id', 'created_at']) as $s) {
            if ($in($bySchool[$s->id] ?? 0)) {
                $add($s->created_at, 2);
            }
        }
        foreach ($this->completions($from, $to)->get(['student_id', 'completed_at']) as $c) {
            if ($in($bySchool[$c->student_id] ?? 0)) {
                $add($c->completed_at, 3);
            }
        }

        return [['Semana que empieza', 'Escuelas nuevas', 'Alumnos nuevos', 'Actividades completadas'], ...array_values($weeks)];
    }

    // Visitas: personas que dijeron su zona, por municipio y zona. Las zonas usan "Rosarito" y no "Playas de Rosarito".
    private function visitas(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $zona = $municipio ? (array_search($municipio, config('zonas.catalogo'), true) ?: $municipio) : null;
        $rows = DB::table('visit_zones')
            ->when($zona, fn ($q) => $q->where('municipio', $zona))
            ->when($from, fn ($q) => $q->where('day', '>=', $from->toDateString()))
            ->when($to, fn ($q) => $q->where('day', '<=', $to->toDateString()))
            ->select('municipio', 'zona', DB::raw('sum(visits) as total'))
            ->groupBy('municipio', 'zona')->orderBy('municipio')->orderByDesc('total')->get()
            ->map(fn ($r) => [$r->municipio, $r->zona, (int) $r->total])->all();

        return [['Municipio', 'Zona', 'Visitas'], ...$rows];
    }

    // Opiniones de la Comunidad Cimarrona: son anónimas y no tienen municipio, así que ese filtro no aplica.
    private function opiniones(?string $municipio, ?Carbon $from, ?Carbon $to): array
    {
        $rows = DB::table('opinions')
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('created_at', '<=', $to))
            ->orderBy('created_at')->get(['created_at', 'rating', 'comment', 'origin', 'hidden_reason'])
            ->map(fn ($r) => [
                Carbon::parse($r->created_at)->toDateString(), (int) $r->rating, $r->comment ?? '',
                $r->origin === 'actividad' ? 'Al terminar una actividad' : 'Comunidad',
                $r->hidden_reason ? 'Oculta' : 'Visible',
            ])->all();

        return [['Fecha', 'Calificación', 'Comentario', 'Dónde', 'Estado'], ...$rows];
    }
}
