<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Actividades y puntos. El navegador solo dice "empecé", "terminé" o "contesté esto".
// El servidor decide si se dan los puntos: una vez por actividad, con tiempo mínimo y respuesta correcta.
class ActivityController extends Controller
{
    // Después de este tiempo sin terminar, el inicio ya no cuenta y hay que volver a abrir el juego.
    public const START_VALID_HOURS = ['aviso' => 6, 'externo' => 3];

    public static function catalog(): array
    {
        $questions = DB::table('activity_questions')->get()->keyBy('activity_id');

        return DB::table('activities')->where('active', true)->orderBy('sort')->get()
            ->map(function ($a) use ($questions) {
                $q = $questions[$a->id] ?? null;

                return [
                    'key' => $a->key,
                    'title' => $a->title,
                    'kind' => $a->kind,
                    'mode' => $a->mode,
                    'points' => (int) $a->points,
                    'route' => $a->route,
                    'min_minutes' => (int) ceil($a->min_seconds / 60),
                    'question' => $q ? ['text' => $q->text, 'options' => json_decode($q->options, true)] : null,
                ];
            })->all();
    }

    public function index(): JsonResponse
    {
        return response()->json(['activities' => self::catalog()])->header('Cache-Control', 'public, max-age=300');
    }

    private static function activity(string $key): ?object
    {
        return DB::table('activities')->where('key', $key)->where('active', true)->first();
    }

    private function student(Request $request): Student
    {
        return $request->attributes->get('student');
    }

    // Guarda la hora de inicio. Si ya había un inicio reciente, se conserva para no reiniciar la cuenta.
    public function start(Request $request, string $key): JsonResponse
    {
        $activity = self::activity($key);
        if (! $activity || $activity->mode === 'pregunta') {
            return response()->json(['message' => 'Esa actividad no existe.'], 404);
        }
        $student = $this->student($request);
        $existing = DB::table('activity_starts')->where('student_id', $student->id)->where('activity_id', $activity->id)->first();
        $hours = self::START_VALID_HOURS[$activity->mode];
        if (! $existing) {
            DB::table('activity_starts')->insertOrIgnore(['student_id' => $student->id, 'activity_id' => $activity->id, 'started_at' => now()]);
        } elseif (now()->subHours($hours)->greaterThan($existing->started_at)) {
            DB::table('activity_starts')->where('id', $existing->id)->update(['started_at' => now()]);
        }

        return response()->json(['ok' => true]);
    }

    // Revisa el inicio guardado con la hora del servidor. Regresa null si está bien o el error para el alumno.
    private static function timingError(object $activity, int $studentId): ?array
    {
        $startedAt = DB::table('activity_starts')->where('student_id', $studentId)->where('activity_id', $activity->id)->value('started_at');
        if (! $startedAt) {
            return ['reason' => 'sin-inicio', 'message' => 'Primero abre la actividad desde el botón Jugar.'];
        }
        $elapsed = now()->getTimestamp() - \Illuminate\Support\Carbon::parse($startedAt)->getTimestamp();
        if ($elapsed < $activity->min_seconds) {
            return ['reason' => 'muy-rapido', 'message' => 'Parece que fue muy rápido. Termina el juego y regresa.'];
        }
        if ($elapsed > self::START_VALID_HOURS[$activity->mode] * 3600) {
            return ['reason' => 'muy-tarde', 'message' => 'Ya pasó mucho tiempo. Vuelve a abrir el juego desde el botón Jugar.'];
        }

        return null;
    }

    private static function complete(object $activity, int $studentId): array
    {
        $created = DB::table('completions')->insertOrIgnore([
            'student_id' => $studentId,
            'activity_id' => $activity->id,
            'points' => $activity->points,
            'completed_at' => now(),
        ]);

        return [
            'completed' => true,
            'new' => $created > 0,
            'points' => $created > 0 ? (int) $activity->points : 0,
            'total' => self::total($studentId),
        ];
    }

    public static function isCompleted(int $studentId, string $key): bool
    {
        return DB::table('completions')
            ->join('activities', 'activities.id', '=', 'completions.activity_id')
            ->where('completions.student_id', $studentId)
            ->where('activities.key', $key)
            ->exists();
    }

    public static function total(int $studentId): int
    {
        return (int) DB::table('completions')->where('student_id', $studentId)->sum('points');
    }

    // Juego propio terminado: CuencaPuntos.terminar(clave).
    public function finish(Request $request, string $key): JsonResponse
    {
        $activity = self::activity($key);
        if (! $activity || $activity->mode !== 'aviso') {
            return response()->json(['message' => 'Esa actividad no existe.'], 404);
        }
        $studentId = $this->student($request)->id;
        if (DB::table('completions')->where('student_id', $studentId)->where('activity_id', $activity->id)->exists()) {
            return response()->json(self::complete($activity, $studentId));
        }
        if ($error = self::timingError($activity, $studentId)) {
            return response()->json($error, 422);
        }

        return response()->json(self::complete($activity, $studentId));
    }

    // Respuesta a la pregunta de una lectura, un consejo o un juego externo.
    public function answer(Request $request, string $key): JsonResponse
    {
        $activity = self::activity($key);
        if (! $activity || $activity->mode === 'aviso') {
            return response()->json(['message' => 'Esa actividad no existe.'], 404);
        }
        $data = $request->validate(['answer' => ['required', 'integer', 'between:0,9']]);
        $studentId = $this->student($request)->id;
        if (DB::table('completions')->where('student_id', $studentId)->where('activity_id', $activity->id)->exists()) {
            return response()->json(self::complete($activity, $studentId));
        }
        if ($activity->mode === 'externo' && ($error = self::timingError($activity, $studentId))) {
            return response()->json($error, 422);
        }
        $correct = DB::table('activity_questions')->where('activity_id', $activity->id)->value('answer');
        if ($correct === null || (int) $correct !== (int) $data['answer']) {
            return response()->json(['completed' => false, 'reason' => 'incorrecta', 'message' => 'Esa no es. Vuelve a leer y contesta otra vez.'], 422);
        }

        return response()->json(self::complete($activity, $studentId));
    }

    // Lo que el alumno ya completó, para las etiquetas del sitio.
    public static function progress(int $studentId): array
    {
        $done = DB::table('completions')
            ->join('activities', 'activities.id', '=', 'completions.activity_id')
            ->where('completions.student_id', $studentId)
            ->pluck('activities.key');

        return ['points' => self::total($studentId), 'completed' => $done->values()->all()];
    }
}
