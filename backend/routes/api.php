<?php

use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function (): void {
    Route::get('/stats', [VisitController::class, 'stats']);
    Route::post('/visits', [VisitController::class, 'store']);
    Route::post('/game-sessions', [GameSessionController::class, 'store']);
});
