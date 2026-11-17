<?php

namespace App\Http\Controllers;

use App\Mail\Notice;
use App\Models\User;
use App\Support\AccountTokens;
use App\Support\Audit;
use App\Support\Mailer;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

// Cuentas del equipo: administración completa (admin) o solo para ver datos (viewer).
// Se invita con un correo; la persona pone su contraseña al abrir el enlace.
class StaffController extends Controller
{
    public const ROLES = ['admin', 'viewer'];

    public const INVITE_DAYS = 7;

    private static function data(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'active' => $user->email_verified_at !== null,
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $users = User::whereIn('role', self::ROLES)->orderBy('role')->orderBy('name')->get();

        return response()->json(['users' => $users->map(fn (User $u) => self::data($u) + ['me' => $u->id === $request->user()->id])]);
    }

    private static function sendInvite(User $user, User $by): array
    {
        $token = AccountTokens::create($user, 'invite', self::INVITE_DAYS * 24 * 60);
        $link = Settings::publicUrl().'/invitacion?token='.$token;
        $sent = Mailer::send($user->email, new Notice(
            'Te invitaron a Cuenca Cimarrona',
            [
                "{$by->name} te dio acceso al panel de Cuenca Cimarrona".($user->role === 'viewer' ? ' para consultar los datos.' : ' como administrador.'),
                'Toca el botón para poner tu contraseña. El enlace sirve '.self::INVITE_DAYS.' días.',
            ],
            'Poner mi contraseña',
            $link,
        ));

        // Si el correo no está configurado, el enlace se muestra para copiarlo y mandarlo por otro medio.
        return ['mail_sent' => $sent, 'link' => $link];
    }

    public function invite(Request $request): JsonResponse
    {
        AuthController::normalizeEmail($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'role' => ['required', Rule::in(self::ROLES)],
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Str::random(40),
            'role' => $data['role'],
        ]);
        Audit::log('admin', $request->user()->id, 'invitar-cuenta', 'user', $user->id, ['rol' => $data['role']]);

        return response()->json(['user' => self::data($user)] + self::sendInvite($user, $request->user()), 201);
    }

    public function newLink(Request $request, User $user): JsonResponse
    {
        abort_unless(in_array($user->role, self::ROLES, true), 404);

        return response()->json(self::sendInvite($user, $request->user()));
    }

    private static function lastAdmin(User $user): bool
    {
        return $user->role === 'admin' && User::where('role', 'admin')->whereNotNull('email_verified_at')->where('id', '!=', $user->id)->doesntExist();
    }

    public function update(Request $request, User $user): JsonResponse
    {
        abort_unless(in_array($user->role, self::ROLES, true), 404);
        $data = $request->validate(['role' => ['required', Rule::in(self::ROLES)]]);
        if ($data['role'] !== 'admin' && self::lastAdmin($user)) {
            return response()->json(['message' => 'Tiene que quedar al menos una cuenta de administración.'], 422);
        }
        $user->role = $data['role'];
        $user->save();
        Audit::log('admin', $request->user()->id, 'cambiar-rol', 'user', $user->id, ['rol' => $data['role']]);

        return response()->json(['user' => self::data($user)]);
    }

    public function remove(Request $request, User $user): JsonResponse
    {
        abort_unless(in_array($user->role, self::ROLES, true), 404);
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes quitarte el acceso a ti mismo.'], 422);
        }
        if (self::lastAdmin($user)) {
            return response()->json(['message' => 'Tiene que quedar al menos una cuenta de administración.'], 422);
        }
        DB::table('sessions')->where('user_id', $user->id)->delete();
        Audit::log('admin', $request->user()->id, 'quitar-cuenta', 'user', $user->id, ['correo' => $user->email]);
        $user->delete();

        return response()->json(['ok' => true]);
    }

    // La persona invitada abre el enlace y pone su contraseña.
    public function accept(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'max:200', AuthController::passwordRule()],
        ]);
        $user = AccountTokens::consume($data['token'], 'invite');
        if (! $user || ! in_array($user->role, self::ROLES, true)) {
            return response()->json(['message' => 'La invitación ya no sirve. Pide otra a quien te invitó.'], 422);
        }
        $user->forceFill(['password' => Hash::make($data['password']), 'email_verified_at' => now()])->save();
        $codes = \App\Support\RecoveryCodes::generate($user);
        DB::table('sessions')->where('user_id', $user->id)->delete();
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->toSession(), 'recovery_codes' => $codes]);
    }
}
