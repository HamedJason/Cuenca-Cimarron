<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolTeachersController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
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

    Route::middleware('rol:school,aprobada')->prefix('escuela')->group(function (): void {
        Route::get('/docentes', [SchoolTeachersController::class, 'index']);
        Route::post('/docentes', [SchoolTeachersController::class, 'store']);
        Route::post('/docentes/{teacher}/enlace', [SchoolTeachersController::class, 'newLink']);
        Route::post('/docentes/{teacher}/baja', [SchoolTeachersController::class, 'deactivate']);
        Route::post('/docentes/{teacher}/alta', [SchoolTeachersController::class, 'reactivate']);
        Route::get('/grupos', [SchoolTeachersController::class, 'classrooms']);
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

// Docentes y alumnos: cookie propia de larga duración, sin sesión de Laravel.
Route::middleware('throttle:300,1')->group(function (): void {
    Route::post('/docente/acceso', [SchoolTeachersController::class, 'redeem']);
    Route::get('/unirse/{code}', [StudentController::class, 'preview'])->middleware('throttle:60,1');
    Route::post('/unirse', [StudentController::class, 'join']);
    Route::post('/regresar', [StudentController::class, 'comeBack']);

    Route::middleware('equipo:student,opcional')->group(function (): void {
        Route::get('/yo', [StudentController::class, 'me']);
        Route::post('/yo/salir', [StudentController::class, 'logout']);
    });

    Route::middleware('equipo:teacher')->prefix('docente')->group(function (): void {
        Route::get('/', [TeacherController::class, 'me']);
        Route::post('/salir', [TeacherController::class, 'logout']);
        Route::get('/grupos', [TeacherController::class, 'classrooms']);
        Route::post('/grupos', [TeacherController::class, 'createClassroom']);
        Route::put('/grupos/{classroom}', [TeacherController::class, 'updateClassroom']);
        Route::post('/grupos/{classroom}/codigo', [TeacherController::class, 'newCode']);
        Route::post('/grupos/{classroom}/archivar', [TeacherController::class, 'archive']);
        Route::get('/grupos/{classroom}/alumnos', [TeacherController::class, 'students']);
        Route::put('/alumnos/{student}', [TeacherController::class, 'renameStudent']);
        Route::delete('/alumnos/{student}', [TeacherController::class, 'deleteStudent']);
        Route::post('/alumnos/{student}/acceso', [TeacherController::class, 'resetStudentAccess']);
    });
});
