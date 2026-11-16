<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\SchoolCatalogController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolTeachersController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

// Límites por IP altos (AppServiceProvider): un salón entero sale a internet con la misma IP de la escuela.
Route::middleware('throttle:publico')->group(function (): void {
    Route::get('/stats', [VisitController::class, 'stats']);
    Route::post('/visits', [VisitController::class, 'store']);
    Route::get('/game-sessions', [GameSessionController::class, 'stats']);
    Route::post('/game-sessions', [GameSessionController::class, 'store']);
    Route::get('/version', [SystemController::class, 'version']);
    Route::get('/catalogo-escuelas', [SchoolCatalogController::class, 'search']);
    Route::get('/respaldo', [AdminController::class, 'backupWithKey']);
});

Route::get('/tls/permitir', [SystemController::class, 'allowCertificate']);

// Escuelas y administradores: sesión con cookie y protección CSRF.
Route::middleware(['web', 'throttle:cuentas'])->group(function (): void {
    Route::get('/sesion', [AuthController::class, 'session']);
    Route::post('/configurar', [AuthController::class, 'setup']);
    Route::post('/entrar', [AuthController::class, 'login']);
    Route::post('/salir', [AuthController::class, 'logout']);
    Route::post('/escuelas', [SchoolController::class, 'register']);
    Route::post('/correo/confirmar', [AuthController::class, 'verify']);
    Route::post('/contrasena/olvide', [AuthController::class, 'forgot']);
    Route::post('/contrasena/nueva', [AuthController::class, 'reset']);
    Route::post('/invitacion', [StaffController::class, 'accept']);

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

    // Consulta de datos: administración completa y cuentas de solo lectura.
    Route::middleware('rol:admin|viewer')->prefix('admin')->group(function (): void {
        Route::get('/escuelas', [AdminController::class, 'schools']);
        Route::get('/estadisticas', [StatsController::class, 'index']);
        Route::get('/catalogo-escuelas', [SchoolCatalogController::class, 'status']);
    });

    Route::middleware('rol:admin')->prefix('admin')->group(function (): void {
        Route::get('/usuarios', [StaffController::class, 'index']);
        Route::post('/usuarios', [StaffController::class, 'invite']);
        Route::put('/usuarios/{user}', [StaffController::class, 'update']);
        Route::post('/usuarios/{user}/enlace', [StaffController::class, 'newLink']);
        Route::delete('/usuarios/{user}', [StaffController::class, 'remove']);
        Route::post('/catalogo-escuelas', [SchoolCatalogController::class, 'import']);
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
Route::middleware('throttle:aula')->group(function (): void {
    Route::post('/docente/acceso', [SchoolTeachersController::class, 'redeem']);
    Route::get('/unirse/{code}', [StudentController::class, 'preview'])->middleware('throttle:codigos');
    Route::post('/unirse', [StudentController::class, 'join']);
    Route::post('/regresar', [StudentController::class, 'comeBack']);

    Route::get('/actividades', [ActivityController::class, 'index']);

    Route::middleware('equipo:student,opcional')->group(function (): void {
        Route::get('/yo', [StudentController::class, 'me']);
        Route::post('/yo/salir', [StudentController::class, 'logout']);
    });

    Route::put('/yo/cimarron', [StudentController::class, 'saveAvatar'])->middleware('equipo:student');

    Route::middleware('equipo:student')->prefix('actividades/{key}')->where(['key' => '[a-z0-9-]{2,60}'])->group(function (): void {
        Route::post('/inicio', [ActivityController::class, 'start']);
        Route::post('/terminar', [ActivityController::class, 'finish']);
        Route::post('/respuesta', [ActivityController::class, 'answer']);
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
        Route::get('/grupos/{classroom}/tareas', [AssignmentController::class, 'index']);
        Route::post('/grupos/{classroom}/tareas', [AssignmentController::class, 'store']);
        Route::delete('/grupos/{classroom}/tareas/{key}', [AssignmentController::class, 'destroy']);
        Route::get('/grupos/{classroom}/avance', [AssignmentController::class, 'progress']);
        Route::get('/grupos/{classroom}/avance.csv', [AssignmentController::class, 'csv']);
        Route::put('/alumnos/{student}', [TeacherController::class, 'renameStudent']);
        Route::delete('/alumnos/{student}', [TeacherController::class, 'deleteStudent']);
        Route::post('/alumnos/{student}/acceso', [TeacherController::class, 'resetStudentAccess']);
    });
});
