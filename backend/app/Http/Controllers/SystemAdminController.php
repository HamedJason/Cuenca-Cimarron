<?php

namespace App\Http\Controllers;

use App\Support\Audit;
use App\Support\DemoMode;
use App\Support\DeviceAuth;
use App\Support\Mailer;
use App\Support\Privacy;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Estado del sitio, mantenimiento y bitácora. Solo para la administración del sistema.
class SystemAdminController extends Controller
{
    private static function lastAudit(array $actions): ?string
    {
        $at = DB::table('audit_logs')->whereIn('action', $actions)->max('created_at');

        return $at ? \Illuminate\Support\Carbon::parse($at)->toIso8601String() : null;
    }

    public function status(Request $request): JsonResponse
    {
        try {
            DB::select('select 1');
            $database = true;
        } catch (\Throwable) {
            $database = false;
        }
        $size = null;
        if (config('database.default') === 'pgsql') {
            $size = (int) DB::selectOne('select pg_database_size(current_database()) as size')->size;
        }
        $folder = config('instalacion.respaldos');
        $savedBackup = null;
        if (is_dir($folder)) {
            $files = glob($folder.'/*.sql.gz') ?: [];
            if ($files) {
                $savedBackup = date(DATE_ATOM, max(array_map('filemtime', $files)));
            }
        }
        $lastAutoBackup = self::lastAudit(['respaldo-automatico']);
        $lastManualBackup = self::lastAudit(['descargar-respaldo', 'descargar-respaldo-guardado']);
        $newestBackup = collect([$savedBackup, $lastAutoBackup, $lastManualBackup])->filter()->max();
        $catalogAt = DB::table('school_catalog')->max('updated_at');
        $catalogTotal = DB::table('school_catalog')->count();
        $publicUrl = Settings::publicUrl();

        $checks = [
            ['key' => 'database', 'ok' => $database, 'label' => 'Base de datos', 'detail' => $database ? 'Responde bien' : 'No responde'],
            ['key' => 'backup', 'ok' => $newestBackup && now()->subDays(2)->lessThan($newestBackup), 'label' => 'Respaldos', 'detail' => $newestBackup ? 'Último respaldo: '.\Illuminate\Support\Carbon::parse($newestBackup)->toIso8601String() : 'Todavía no hay ningún respaldo', 'date' => $newestBackup],
            ['key' => 'https', 'ok' => str_starts_with($publicUrl, 'https://'), 'label' => 'Dirección pública', 'detail' => $publicUrl],
            ['key' => 'catalog', 'ok' => $catalogTotal > 0, 'label' => 'Catálogo de escuelas', 'detail' => $catalogTotal ? "{$catalogTotal} escuelas" : 'Vacío. Cárgalo en la pestaña Escuelas', 'date' => $catalogAt ? \Illuminate\Support\Carbon::parse($catalogAt)->toIso8601String() : null],
        ];

        return response()->json([
            'commit' => config('app.commit'),
            'php' => PHP_VERSION,
            'laravel' => app()->version(),
            'database_size' => $size,
            'checks' => $checks,
            'counts' => [
                'escuelas' => DB::table('schools')->count(),
                'docentes' => DB::table('teachers')->count(),
                'grupos' => DB::table('classrooms')->count(),
                'alumnos' => DB::table('students')->whereNull('anonymized_at')->count(),
                'alumnos_anonimos' => DB::table('students')->whereNotNull('anonymized_at')->count(),
                'actividades_completadas' => DB::table('completions')->count(),
                'visitas' => DB::table('visits')->count(),
                'equipos_con_sesion' => DB::table('device_sessions')->whereNull('revoked_at')->where('expires_at', '>', now())->count(),
                'sesiones_de_cuentas' => DB::table('sessions')->whereNotNull('user_id')->count(),
                'bitacora' => DB::table('audit_logs')->count(),
            ],
            'demo' => [
                'on' => DemoMode::enabled(),
                'until' => DemoMode::until()?->toIso8601String(),
                'forced' => DemoMode::forced(),
            ],
        ]);
    }

    // Borra sesiones caducadas y enlaces viejos, y aplica el borrado de nombres de grupos archivados.
    public function cleanup(Request $request): JsonResponse
    {
        $before = DB::table('device_sessions')->count();
        DeviceAuth::maybeCleanup(true);
        $anonymized = Privacy::anonymizeOldClassrooms();
        $staleSessions = DB::table('sessions')->where('last_activity', '<', now()->subDays(30)->getTimestamp())->delete();
        Audit::log('admin', $request->user()->id, 'limpieza');

        return response()->json([
            'device_sessions_removed' => $before - DB::table('device_sessions')->count(),
            'students_anonymized' => $anonymized,
            'account_sessions_removed' => $staleSessions,
        ]);
    }

    // Modo demostración: encenderlo crea los datos demo y abre /testeo_20nov por 24 horas.
    // Apagarlo borra todo lo demo. Pide escribir ENCENDER o APAGAR para confirmar.
    public function demo(Request $request): JsonResponse
    {
        $data = $request->validate(['accion' => ['required', 'in:encender,apagar'], 'confirm' => ['required', 'string']]);
        if (strtoupper($data['confirm']) !== strtoupper($data['accion'])) {
            return response()->json(['message' => 'Escribe '.strtoupper($data['accion']).' para confirmar.'], 422);
        }
        if ($data['accion'] === 'encender') {
            $until = DemoMode::turnOn();
            Audit::log('admin', $request->user()->id, 'encender-demo', null, null, ['hasta' => $until->toIso8601String()]);
        } else {
            DemoMode::turnOff();
            Audit::log('admin', $request->user()->id, 'apagar-demo');
        }

        return response()->json(['on' => DemoMode::enabled(), 'until' => DemoMode::until()?->toIso8601String()]);
    }

    public function audit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'accion' => ['nullable', 'string', 'max:60'],
            'antes_de' => ['nullable', 'integer', 'min:1'],
            'por' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $per = (int) ($data['por'] ?? 20);
        $rows = DB::table('audit_logs')
            ->when($data['accion'] ?? null, fn ($q, $a) => $q->where('action', $a))
            ->when($data['antes_de'] ?? null, fn ($q, $id) => $q->where('id', '<', $id))
            ->orderByDesc('id')->limit($per)->get();

        $users = DB::table('users')->whereIn('id', $rows->whereIn('actor_type', ['admin', 'school'])->pluck('actor_id')->merge($rows->where('subject_type', 'user')->pluck('subject_id'))->filter())->pluck('email', 'id');
        $teachers = DB::table('teachers')->whereIn('id', $rows->where('actor_type', 'teacher')->pluck('actor_id')->merge($rows->where('subject_type', 'teacher')->pluck('subject_id'))->filter())->pluck('name', 'id');
        $schools = DB::table('schools')->whereIn('id', $rows->where('subject_type', 'school')->pluck('subject_id')->filter())->pluck('name', 'id');
        $classrooms = DB::table('classrooms')->whereIn('id', $rows->where('subject_type', 'classroom')->pluck('subject_id')->filter())->pluck('name', 'id');

        $actor = fn ($r) => match ($r->actor_type) {
            'admin', 'school' => $users[$r->actor_id] ?? "Cuenta #{$r->actor_id}",
            'teacher' => 'Docente '.($teachers[$r->actor_id] ?? "#{$r->actor_id}"),
            default => 'Sistema',
        };
        $subject = fn ($r) => match ($r->subject_type) {
            'school' => $schools[$r->subject_id] ?? "Escuela #{$r->subject_id}",
            'teacher' => 'Docente '.($teachers[$r->subject_id] ?? "#{$r->subject_id}"),
            'classroom' => 'Grupo '.($classrooms[$r->subject_id] ?? "#{$r->subject_id}"),
            'user' => $users[$r->subject_id] ?? "Cuenta #{$r->subject_id}",
            'student' => "Alumno #{$r->subject_id}",
            default => null,
        };

        return response()->json([
            'entries' => $rows->map(fn ($r) => [
                'id' => (int) $r->id,
                'at' => \Illuminate\Support\Carbon::parse($r->created_at)->toIso8601String(),
                'actor_type' => $r->actor_type,
                'actor' => $actor($r),
                'action' => $r->action,
                'subject' => $subject($r),
                'details' => $r->details ? json_decode($r->details, true) : null,
            ]),
            'actions' => DB::table('audit_logs')->distinct()->orderBy('action')->pluck('action'),
            'more' => $rows->count() === $per,
        ]);
    }
}
