<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function (): void {
    Route::get('/stats', [VisitController::class, 'stats']);
    Route::post('/visits', [VisitController::class, 'store']);
    Route::get('/game-sessions', [GameSessionController::class, 'stats']);
    Route::post('/game-sessions', [GameSessionController::class, 'store']);
    Route::get('/version', [SystemController::class, 'version']);
    Route::get('/respaldo', [AdminController::class, 'backupWithKey']);
});

Route::get('/tls/permitir', [SystemController::class, 'allowCertificate']);

// Escuelas y administradores: sesión con cookie y protección CSRF.
Route::middleware(['web', 'throttle:120,1'])->group(function (): void {
    Route::get('/sesion', [AuthController::class, 'session']);
    Route::post('/configurar', [AuthController::class, 'setup']);
    Route::post('/entrar', [AuthController::class, 'login']);
    Route::post('/salir', [AuthController::class, 'logout']);
    Route::post('/escuelas', [SchoolController::class, 'register']);
    Route::post('/correo/confirmar', [AuthController::class, 'verify']);
    Route::post('/contrasena/olvide', [AuthController::class, 'forgot']);
    Route::post('/contrasena/nueva', [AuthController::class, 'reset']);

    Route::middleware('rol:school')->group(function (): void {
        Route::post('/correo/reenviar', [AuthController::class, 'resendVerification']);
        Route::put('/escuela', [SchoolController::class, 'update']);
    });

    Route::middleware('rol:admin')->prefix('admin')->group(function (): void {
        Route::get('/escuelas', [AdminController::class, 'schools']);
        Route::post('/escuelas/{school}/aprobar', [AdminController::class, 'approve']);
        Route::post('/escuelas/{school}/rechazar', [AdminController::class, 'reject']);
        Route::get('/ajustes', [AdminController::class, 'settings']);
        Route::put('/ajustes', [AdminController::class, 'saveSettings']);
        Route::post('/ajustes/correo-prueba', [AdminController::class, 'testMail']);
        Route::get('/respaldo', [AdminController::class, 'backup']);
        Route::get('/respaldos', [AdminController::class, 'savedBackups']);
        Route::get('/respaldos/{file}', [AdminController::class, 'downloadSaved']);
        Route::post('/respaldo/clave', [AdminController::class, 'backupKey']);
    });
});
