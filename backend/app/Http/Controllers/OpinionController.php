<?php

namespace App\Http\Controllers;

use App\Support\Audit;
use App\Support\Groserias;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

// Comunidad Cimarrona: opiniones 100 % anónimas.
// No se guarda IP, usuario, alumno ni escuela. El freno de spam vive solo en la caché:
// huellas con sal del dispositivo y de la IP que se borran solas a los 10 minutos.
class OpinionController extends Controller
{
    public const POR_PAGINA = 10;
    // La página muestra como máximo las 30 opiniones más recientes.
    public const MAXIMO_VISIBLE = 30;
    // Un dispositivo manda una opinión cada 10 minutos.
    public const ESPERA_SEGUNDOS = 600;
    // Una escuela entera sale con la misma IP: el límite por IP es alto y solo frena abusos.
    public const MAXIMO_POR_IP = 40;

    public function index(Request $request): JsonResponse
    {
        $before = (int) $request->query('antes_de', 0);
        $visible = fn () => DB::table('opinions')->whereNull('hidden_reason')->whereNotNull('comment');
        $query = $visible()->orderByDesc('id');
        $left = self::MAXIMO_VISIBLE;
        if ($before > 0) {
            $query->where('id', '<', $before);
            $left -= $visible()->where('id', '>=', $before)->count();
        }
        $take = max(0, min(self::POR_PAGINA, $left));
        $rows = $take ? $query->limit($take + 1)->get(['id', 'rating', 'comment', 'created_at']) : collect();

        return response()->json([
            'summary' => $this->summary(),
            'opinions' => $rows->take($take)->map(fn ($row) => [
                'id' => $row->id,
                'rating' => (int) $row->rating,
                'comment' => $row->comment,
                'created_at' => Carbon::parse($row->created_at)->toIso8601String(),
            ])->values(),
            'more' => $rows->count() > $take && $left > $take,
        ])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:500'],
            'device' => ['required', 'uuid'],
            'origin' => ['nullable', 'in:comunidad,actividad'],
            // Campo trampa: la gente no lo ve, los robots lo llenan.
            'sitio' => ['nullable', 'string', 'max:200'],
        ], [
            'rating.required' => 'Elige de 1 a 5 cimarrones',
            'rating.between' => 'Elige de 1 a 5 cimarrones',
            'comment.max' => 'El comentario puede tener hasta 500 letras',
        ]);
        if (filled($data['sitio'] ?? null)) {
            return response()->json(['saved' => true, 'summary' => $this->summary()], 201);
        }

        $key = config('app.key');
        $deviceKey = 'opinion-dispositivo|'.hash_hmac('sha256', $data['device'], $key);
        $ipKey = 'opinion-ip|'.hash_hmac('sha256', (string) $request->ip(), $key);
        if (RateLimiter::tooManyAttempts($deviceKey, 1)) {
            $minutes = max(1, (int) ceil(RateLimiter::availableIn($deviceKey) / 60));

            return response()->json([
                'message' => "Ya mandaste una opinión hace poco. Puedes mandar otra en {$minutes} ".($minutes === 1 ? 'minuto' : 'minutos'),
            ], 429);
        }
        if (RateLimiter::tooManyAttempts($ipKey, self::MAXIMO_POR_IP)) {
            return response()->json(['message' => 'Llegaron muchas opiniones desde esta red. Intenta en unos minutos'], 429);
        }
        RateLimiter::hit($deviceKey, self::ESPERA_SEGUNDOS);
        RateLimiter::hit($ipKey, self::ESPERA_SEGUNDOS);

        $comment = trim(preg_replace('~\s+~u', ' ', (string) ($data['comment'] ?? '')));
        $comment = $comment === '' ? null : $comment;
        $now = now();
        DB::table('opinions')->insert([
            'rating' => $data['rating'],
            'comment' => $comment,
            'origin' => $data['origin'] ?? 'comunidad',
            'hidden_reason' => $comment !== null && Groserias::contiene($comment) ? 'filtro' : null,
            // Redondeada a 10 minutos: alcanza para "hace un rato" y no permite cruzarla con otros registros.
            'created_at' => $now->copy()->setMinute(intdiv($now->minute, 10) * 10)->setSecond(0)->setMicrosecond(0),
        ]);

        return response()->json(['saved' => true, 'summary' => $this->summary()], 201);
    }

    // Administración: todas las opiniones con su estado, para ocultar o volver a mostrar.
    public function adminIndex(Request $request): JsonResponse
    {
        $before = (int) $request->query('antes_de', 0);
        $query = DB::table('opinions')->whereNotNull('comment')->orderByDesc('id');
        if ($request->query('filtro') === 'ocultas') {
            $query->whereNotNull('hidden_reason');
        }
        if ($before > 0) {
            $query->where('id', '<', $before);
        }
        $rows = $query->limit(21)->get(['id', 'rating', 'comment', 'origin', 'hidden_reason', 'created_at']);

        return response()->json([
            'summary' => $this->summary(),
            'hidden' => DB::table('opinions')->whereNotNull('hidden_reason')->whereNotNull('comment')->count(),
            'opinions' => $rows->take(20)->map(fn ($row) => [
                'id' => $row->id,
                'rating' => (int) $row->rating,
                'comment' => $row->comment,
                'origin' => $row->origin,
                'hidden_reason' => $row->hidden_reason,
                'created_at' => Carbon::parse($row->created_at)->toIso8601String(),
            ])->values(),
            'more' => $rows->count() > 20,
        ]);
    }

    public function hide(Request $request, int $opinion): JsonResponse
    {
        return $this->moderate($request, $opinion, 'admin');
    }

    public function show(Request $request, int $opinion): JsonResponse
    {
        return $this->moderate($request, $opinion, null);
    }

    private function moderate(Request $request, int $id, ?string $reason): JsonResponse
    {
        $updated = DB::table('opinions')->where('id', $id)->update(['hidden_reason' => $reason]);
        abort_unless($updated || DB::table('opinions')->where('id', $id)->exists(), 404);
        Audit::log('admin', $request->user()->id, $reason ? 'ocultar-opinion' : 'mostrar-opinion', 'opinion', $id);

        return response()->json(['id' => $id, 'hidden_reason' => $reason]);
    }

    private function summary(): array
    {
        $counts = DB::table('opinions')->select('rating', DB::raw('count(*) as total'))->groupBy('rating')->pluck('total', 'rating');
        $count = (int) $counts->sum();
        $sum = 0;
        $stars = [];
        foreach ([5, 4, 3, 2, 1] as $rating) {
            $stars[(string) $rating] = (int) ($counts[$rating] ?? 0);
            $sum += $rating * $stars[(string) $rating];
        }

        return [
            'count' => $count,
            'average' => $count ? round($sum / $count, 1) : null,
            'stars' => $stars,
        ];
    }
}
