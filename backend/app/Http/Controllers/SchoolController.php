<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SchoolController extends Controller
{
    // CCT: 2 números de estado, 3 letras, 4 números y una letra de control. Ejemplo 02DPR0123X.
    public const CCT_PATTERN = '/^\d{2}[A-Z]{3}\d{4}[A-Z]$/';

    public static function schoolRules(?int $ignoreId = null): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:160'],
            'cct' => ['nullable', 'string', 'regex:'.self::CCT_PATTERN, Rule::unique('schools', 'cct')->ignore($ignoreId)],
            'level' => ['required', Rule::in(School::LEVELS)],
            'shift' => ['required', Rule::in(School::SHIFTS)],
            'sector' => ['required', Rule::in(School::SECTORS)],
            'colonia' => ['required', 'string', 'min:2', 'max:120'],
            'address' => ['required', 'string', 'min:4', 'max:200'],
            'lat' => ['nullable', 'numeric', 'between:31.5,33.5'],
            'lng' => ['nullable', 'numeric', 'between:-118,-115.5'],
            'contact_name' => ['required', 'string', 'min:3', 'max:120'],
        ];
    }

    private static function normalize(array $data): array
    {
        if (array_key_exists('cct', $data)) {
            $data['cct'] = $data['cct'] ? strtoupper(trim($data['cct'])) : null;
        }

        return $data;
    }

    public function register(Request $request): JsonResponse
    {
        AuthController::normalizeEmail($request);
        $request->merge(['cct' => $request->filled('cct') ? strtoupper(trim((string) $request->input('cct'))) : null]);
        $data = $request->validate(self::schoolRules() + [
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'max:200', AuthController::passwordRule()],
            'privacy' => ['accepted'],
            'families_informed' => ['accepted'],
        ]);
        $data = self::normalize($data);
        $user = DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => $data['contact_name'],
                'email' => strtolower($data['email']),
                'password' => $data['password'],
                'role' => 'school',
            ]);
            $school = new School(collect($data)->only(array_keys(self::schoolRules()))->all());
            $school->user_id = $user->id;
            $school->families_informed_at = now();
            $school->save();
            Audit::log('school', $user->id, 'registro', 'school', $school->id);

            return $user;
        });
        $sent = AuthController::sendVerification($user);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->fresh()->toSession(), 'mail_sent' => $sent], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $school = $request->user()->school;
        $request->merge(['cct' => $request->filled('cct') ? strtoupper(trim((string) $request->input('cct'))) : null]);
        $data = self::normalize($request->validate(self::schoolRules($school->id)));
        $school->fill($data);
        // Si la rechazaron y corrige sus datos, vuelve a la fila de revisión.
        if ($school->status === 'rejected') {
            $school->status = 'pending';
            $school->rejection_reason = null;
        }
        $school->save();
        Audit::log('school', $request->user()->id, 'editar-datos', 'school', $school->id);

        return response()->json(['user' => $request->user()->fresh()->toSession()]);
    }
}
