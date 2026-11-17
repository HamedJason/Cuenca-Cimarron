<?php

namespace App\Http\Controllers;

use App\Mail\Notice;
use App\Models\School;
use App\Support\Audit;
use App\Support\Mailer;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function schools(Request $request): JsonResponse
    {
        $data = $request->validate(['estado' => ['nullable', Rule::in(['pending', 'approved', 'rejected', 'suspended'])]]);
        $schools = School::with('user:id,email,email_verified_at')
            ->when($data['estado'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->orderBy('created_at')
            ->get()
            ->map(fn (School $school) => $school->toPublic() + [
                'email' => $school->user->email,
                'email_verified' => $school->user->email_verified_at !== null,
                'created_at' => $school->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'schools' => $schools,
            'counts' => School::select('status', DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    public function approve(Request $request, School $school): JsonResponse
    {
        $request->merge(['cct' => $request->filled('cct') ? strtoupper(trim((string) $request->input('cct'))) : $school->cct]);
        $data = $request->validate([
            'cct' => ['nullable', 'string', 'regex:'.SchoolController::CCT_PATTERN, Rule::unique('schools', 'cct')->ignore($school->id)],
        ]);
        $school->cct = $data['cct'] ?? null;
        $school->status = 'approved';
        $school->rejection_reason = null;
        $school->reviewed_by = $request->user()->id;
        $school->reviewed_at = now();
        $school->save();
        Audit::log('admin', $request->user()->id, 'aprobar-escuela', 'school', $school->id);
        Mailer::send($school->user->email, new Notice(
            'Tu escuela ya está aprobada',
            ["{$school->name} ya puede usar Cuenca Cimarrona.", 'Entra a tu cuenta para dar de alta a tus docentes.'],
            'Entrar',
            Settings::publicUrl().'/escuelas',
        ));

        return response()->json(['school' => $school->toPublic()]);
    }

    public function reject(Request $request, School $school): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:300']]);
        $school->status = 'rejected';
        $school->rejection_reason = $data['reason'];
        $school->reviewed_by = $request->user()->id;
        $school->reviewed_at = now();
        $school->save();
        Audit::log('admin', $request->user()->id, 'rechazar-escuela', 'school', $school->id, ['motivo' => $data['reason']]);
        Mailer::send($school->user->email, new Notice(
            'Revisamos el registro de tu escuela',
            ["No pudimos aprobar el registro de {$school->name} por este motivo: {$data['reason']}", 'Puedes entrar a tu cuenta, corregir los datos y se vuelve a revisar.'],
            'Entrar',
            Settings::publicUrl().'/escuelas',
        ));

        return response()->json(['school' => $school->toPublic()]);
    }

    private const SETTING_KEYS = ['domain', 'public_url', 'mail_host', 'mail_port', 'mail_username', 'mail_encryption', 'mail_from_address', 'mail_from_name'];

    public function settings(): JsonResponse
    {
        $values = [];
        foreach (self::SETTING_KEYS as $key) {
            $values[$key] = Settings::get($key);
        }
        $values['mail_password_set'] = (bool) Settings::get('mail_password');
        $values['backup_key_set'] = (bool) Settings::get('backup_key_hash');
        $values['domain_env'] = config('app.dominio');
        $values['effective_url'] = Settings::publicUrl();

        return response()->json(['settings' => $values]);
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['nullable', 'string', 'max:200', 'regex:/^(?=.{1,200}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i'],
            'public_url' => ['nullable', 'url:http,https', 'max:200'],
            'mail_host' => ['nullable', 'string', 'max:200'],
            'mail_port' => ['nullable', 'integer', 'between:1,65535'],
            'mail_username' => ['nullable', 'string', 'max:200'],
            'mail_password' => ['nullable', 'string', 'max:300'],
            'mail_encryption' => ['nullable', Rule::in(['tls', 'ssl', 'none'])],
            'mail_from_address' => ['nullable', 'email', 'max:200'],
            'mail_from_name' => ['nullable', 'string', 'max:100'],
        ]);
        foreach (self::SETTING_KEYS as $key) {
            if (array_key_exists($key, $data)) {
                $value = $data[$key];
                Settings::set($key, $value === null || $value === '' ? null : ($key === 'domain' ? strtolower($value) : (string) $value));
            }
        }
        // La contraseña del correo solo se cambia si se escribe una nueva.
        if (! empty($data['mail_password'])) {
            Settings::set('mail_password', $data['mail_password']);
        }
        Audit::log('admin', $request->user()->id, 'guardar-ajustes', null, null, ['claves' => array_keys($data)]);

        return $this->settings();
    }

    public function testMail(Request $request): JsonResponse
    {
        $data = $request->validate(['to' => ['nullable', 'email', 'max:160']]);
        if (! Mailer::configured()) {
            return response()->json(['message' => 'Primero llena el servidor de correo.'], 422);
        }
        $sent = Mailer::send($data['to'] ?? $request->user()->email, new Notice(
            'Correo de prueba',
            ['Si te llegó este correo, el servidor de correo de Cuenca Cimarrona está bien configurado.'],
        ));

        return $sent
            ? response()->json(['ok' => true])
            : response()->json(['message' => 'No se pudo mandar. Revisa el servidor, el puerto, el usuario y la contraseña.'], 422);
    }

    // Respaldo de la base en el momento, en SQL comprimido.
    public function backup(Request $request): StreamedResponse|JsonResponse
    {
        Audit::log('admin', $request->user()?->id, 'descargar-respaldo');

        return self::streamBackup();
    }

    public static function streamBackup(): StreamedResponse|JsonResponse
    {
        $db = config('database.connections.'.config('database.default'));
        if (($db['driver'] ?? null) !== 'pgsql') {
            return response()->json(['message' => 'El respaldo solo funciona con PostgreSQL.'], 422);
        }
        $name = 'cuenca-'.now()->format('Y-m-d-His').'.sql.gz';

        return response()->streamDownload(function () use ($db): void {
            $command = ['pg_dump', '--no-owner', '--no-privileges', '-Z', '6', '-h', $db['host'], '-p', (string) $db['port'], '-U', $db['username'], $db['database']];
            $process = proc_open($command, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, ['PGPASSWORD' => $db['password'], 'PATH' => getenv('PATH')]);
            if (! is_resource($process)) {
                return;
            }
            while (! feof($pipes[1])) {
                echo fread($pipes[1], 65536);
                flush();
            }
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($process);
        }, $name, ['Content-Type' => 'application/gzip']);
    }

    public function savedBackups(): JsonResponse
    {
        $dir = config('instalacion.respaldos');
        $files = [];
        foreach (is_dir($dir) ? (glob($dir.'/*.sql.gz') ?: []) : [] as $path) {
            $files[] = ['name' => basename($path), 'size' => filesize($path), 'date' => date(DATE_ATOM, filemtime($path))];
        }
        usort($files, fn ($a, $b) => strcmp($b['name'], $a['name']));

        return response()->json(['backups' => $files, 'folder_ready' => is_dir($dir)]);
    }

    public function downloadSaved(Request $request, string $file): BinaryFileResponse|JsonResponse
    {
        if (! preg_match('/^[A-Za-z0-9._-]+\.sql\.gz$/', $file)) {
            return response()->json(['message' => 'Archivo no válido.'], 404);
        }
        $path = config('instalacion.respaldos').'/'.$file;
        if (! is_file($path)) {
            return response()->json(['message' => 'No existe ese respaldo.'], 404);
        }
        Audit::log('admin', $request->user()->id, 'descargar-respaldo-guardado', null, null, ['archivo' => $file]);

        return response()->download($path);
    }

    // Genera la clave para que GitHub Actions descargue el respaldo diario. Se muestra una sola vez.
    public function backupKey(Request $request): JsonResponse
    {
        $key = bin2hex(random_bytes(24));
        Settings::set('backup_key_hash', hash('sha256', $key));
        Audit::log('admin', $request->user()->id, 'generar-clave-respaldo');

        return response()->json(['key' => $key]);
    }

    // Descarga del respaldo con la clave, sin sesión. La usa el workflow de GitHub.
    public function backupWithKey(Request $request): StreamedResponse|JsonResponse
    {
        $limiter = 'respaldo:'.$request->ip();
        if (RateLimiter::tooManyAttempts($limiter, 5)) {
            return response()->json(['message' => 'Demasiados intentos.'], 429);
        }
        $hash = Settings::get('backup_key_hash');
        $given = (string) $request->header('X-Clave-Respaldo');
        if (! $hash || $given === '' || ! hash_equals($hash, hash('sha256', $given))) {
            RateLimiter::hit($limiter, 3600);

            return response()->json(['message' => 'Clave no válida.'], 403);
        }
        Audit::log('sistema', null, 'respaldo-automatico');

        return self::streamBackup();
    }
}
