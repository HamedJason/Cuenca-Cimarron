<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GameSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => ['required', 'uuid'],
            'session_id' => ['required', 'uuid'],
            'game' => ['required', 'string', Rule::in(config('games.enabled', []))],
        ]);
        $visitor = hash_hmac('sha256', $data['visitor_id'], config('app.key'));
        $session = hash_hmac('sha256', $data['session_id'], config('app.key'));
        $created = DB::transaction(function () use ($visitor, $session, $data): int {
            DB::table('visitors')->insertOrIgnore(['id' => $visitor, 'first_seen_at' => now()]);
            return DB::table('game_sessions')->insertOrIgnore([
                'visitor_id' => $visitor, 'session_id' => $session,
                'game' => $data['game'], 'started_at' => now(),
            ]);
        });

        return response()->json(['recorded' => true], $created ? 201 : 200);
    }
}
