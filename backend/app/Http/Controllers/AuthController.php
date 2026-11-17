<?php

namespace App\Http\Controllers;

use App\Mail\Notice;
use App\Models\User;
use App\Support\AccountTokens;
use App\Support\Audit;
use App\Support\Mailer;
use App\Support\RecoveryCodes;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public static function passwordRule(): Password
    {
        return Password::min(10)->uncompromised();
    }

    // Los correos se comparan siempre en minúsculas.
    public static function normalizeEmail(Request $request): void
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
    }

    // Quién tiene sesión de escuela o administrador. También deja la cookie XSRF-TOKEN.
    public function session(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()?->fresh()?->toSession(),
            'setup_needed' => ! User::where('role', 'admin')->exists(),
        ])->header('Cache-Control', 'no-store');
    }

    // Crea el primer administrador con la clave de instalación. Solo funciona una vez.
    public function setup(Request $request): JsonResponse
    {
        self::normalizeEmail($request);
        $key = 'configurar:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['clave' => 'Demasiados intentos. Espera unos minutos.']);
        }
        if (User::where('role', 'admin')->exists()) {
            return response()->json(['message' => 'El sitio ya tiene administrador.'], 409);
        }
        $data = $request->validate([
            'clave' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'max:200', self::passwordRule()],
        ]);
        $given = hash('sha256', strtoupper(trim($data['clave'])));
        if (! hash_equals((string) config('instalacion.clave_hash'), $given)) {
            RateLimiter::hit($key, 600);
            throw ValidationException::withMessages(['clave' => 'La clave de instalación no es correcta.']);
        }
        $user = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'role' => 'admin',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();
        Audit::log('admin', $user->id, 'configurar');
        // La dirección con la que se configuró el sitio queda como dirección pública para los enlaces
        // de correos y grupos. Así sirve aunque haya un proxy con HTTPS delante. Se cambia en el panel.
        if (! Settings::get('public_url')) {
            $origin = (string) $request->headers->get('Origin');
            Settings::set('public_url', preg_match('#^https?://[a-z0-9.-]+(:\d+)?$#i', $origin) ? strtolower($origin) : $request->getSchemeAndHttpHost());
        }
        $codes = RecoveryCodes::generate($user);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->toSession(), 'recovery_codes' => $codes], 201);
    }

    public function login(Request $request): JsonResponse
    {
        self::normalizeEmail($request);
        $data = $request->validate([
            'email' => ['required', 'email', 'max:160'],
            'password' => ['required', 'string', 'max:200'],
        ]);
        $key = 'entrar:'.strtolower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 8)) {
            $minutes = (int) ceil(RateLimiter::availableIn($key) / 60);
            throw ValidationException::withMessages(['email' => "Demasiados intentos. Vuelve a intentar en {$minutes} min."]);
        }
        if (! Auth::attempt(['email' => strtolower($data['email']), 'password' => $data['password']])) {
            RateLimiter::hit($key, 900);
            throw ValidationException::withMessages(['email' => 'El correo o la contraseña no coinciden.']);
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();

        return response()->json(['user' => $request->user()->toSession()]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public static function sendVerification(User $user): bool
    {
        $token = AccountTokens::create($user, 'verify', 60 * 48);

        return Mailer::send($user->email, new Notice(
            'Confirma tu correo',
            ['Recibimos el registro de tu escuela en Cuenca Cimarrona.', 'Toca el botón para confirmar que este correo es tuyo. El enlace sirve 48 horas.'],
            'Confirmar correo',
            Settings::publicUrl().'/escuelas/confirmar?token='.$token,
        ));
    }

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'size:64']]);
        $user = AccountTokens::consume($data['token'], 'verify');
        if (! $user) {
            return response()->json(['message' => 'El enlace ya no sirve. Entra a tu cuenta y pide otro.'], 422);
        }
        $user->forceFill(['email_verified_at' => now()])->save();

        return response()->json(['ok' => true]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->email_verified_at) {
            return response()->json(['ok' => true, 'sent' => false]);
        }
        $key = 'reenviar:'.$user->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json(['message' => 'Ya mandamos varios correos. Espera unos minutos.'], 429);
        }
        RateLimiter::hit($key, 600);

        return response()->json(['ok' => true, 'sent' => self::sendVerification($user)]);
    }

    // Siempre responde igual para no revelar qué correos tienen cuenta.
    public function forgot(Request $request): JsonResponse
    {
        self::normalizeEmail($request);
        $data = $request->validate(['email' => ['required', 'email', 'max:160']]);
        $email = strtolower($data['email']);
        $key = 'olvide:'.$email;
        $user = User::where('email', $email)->first();
        if ($user && ! RateLimiter::tooManyAttempts($key, 3)) {
            RateLimiter::hit($key, 900);
            $token = AccountTokens::create($user, 'reset', 60);
            Mailer::send($user->email, new Notice(
                'Nueva contraseña',
                ['Alguien pidió cambiar la contraseña de esta cuenta de Cuenca Cimarrona.', 'Si fuiste tú, toca el botón. El enlace sirve una hora. Si no fuiste tú, puedes ignorar este correo.'],
                'Poner contraseña nueva',
                Settings::publicUrl().'/escuelas/contrasena?token='.$token,
            ));
        }

        return response()->json(['ok' => true]);
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'max:200', self::passwordRule()],
        ]);
        $user = AccountTokens::consume($data['token'], 'reset');
        if (! $user) {
            return response()->json(['message' => 'El enlace ya no sirve. Pide otro desde "Olvidé mi contraseña".'], 422);
        }
        $user->forceFill([
            'password' => Hash::make($data['password']),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
        // Cierra las demás sesiones abiertas con la contraseña anterior.
        DB::table('sessions')->where('user_id', $user->id)->delete();

        return response()->json(['ok' => true]);
    }

    // Contraseña nueva con un código de recuperación. No necesita correo.
    public function resetWithCode(Request $request): JsonResponse
    {
        self::normalizeEmail($request);
        $data = $request->validate([
            'email' => ['required', 'email', 'max:160'],
            'code' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'max:200', self::passwordRule()],
        ]);
        $key = 'codigo:'.$data['email'].'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 6)) {
            $minutes = (int) ceil(RateLimiter::availableIn($key) / 60);
            throw ValidationException::withMessages(['code' => "Demasiados intentos. Vuelve a intentar en {$minutes} min."]);
        }
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! RecoveryCodes::consume($user, $data['code'])) {
            RateLimiter::hit($key, 900);
            throw ValidationException::withMessages(['code' => 'El correo o el código no coinciden, o ese código ya se usó.']);
        }
        RateLimiter::clear($key);
        $user->forceFill(['password' => Hash::make($data['password'])])->save();
        DB::table('sessions')->where('user_id', $user->id)->delete();
        Audit::log($user->role === 'school' ? 'school' : 'admin', $user->id, 'contrasena-con-codigo', 'user', $user->id);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->toSession(), 'codes_left' => RecoveryCodes::left($user)]);
    }

    // La cuenta genera códigos nuevos; pide la contraseña actual.
    public function regenerateCodes(Request $request): JsonResponse
    {
        $data = $request->validate(['password' => ['required', 'string', 'max:200']]);
        $user = $request->user();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['password' => 'La contraseña no es correcta.']);
        }
        $codes = RecoveryCodes::generate($user);
        Audit::log($user->role === 'school' ? 'school' : 'admin', $user->id, 'codigos-nuevos', 'user', $user->id);

        return response()->json(['recovery_codes' => $codes]);
    }
}
