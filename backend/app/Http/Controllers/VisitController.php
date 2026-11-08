<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VisitController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => ['required', 'uuid'],
            'session_id' => ['required', 'uuid'],
        ]);
        // Store keyed hashes, never the browser's raw identifiers or personal data.
        $visitor = hash_hmac('sha256', $data['visitor_id'], config('app.key'));
        $session = hash_hmac('sha256', $data['session_id'], config('app.key'));
        DB::transaction(function () use ($visitor, $session): void {
            $now = now();
            DB::table('visitors')->insertOrIgnore([
                'id' => $visitor, 'first_seen_at' => $now,
            ]);
            DB::table('visits')->insertOrIgnore([
                'visitor_id' => $visitor, 'session_id' => $session, 'created_at' => $now,
            ]);
        });

        return $this->stats();
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'unique_visitors' => DB::table('visitors')->count(),
            'total_visits' => DB::table('visits')->count(),
        ])->header('Cache-Control', 'no-store');
    }
}
