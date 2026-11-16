<?php

namespace Tests;

use App\Models\School;
use App\Models\User;
use App\Support\Settings;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Settings::forget();
        // La revisión de contraseñas filtradas no sale a internet durante las pruebas.
        Http::fake(['api.pwnedpasswords.com/*' => Http::response('', 200)]);
    }

    protected function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    protected function school(string $status = 'approved'): User
    {
        $user = User::factory()->create(['role' => 'school']);
        $school = new School([
            'name' => 'Primaria Benito Juárez',
            'level' => 'primaria',
            'shift' => 'matutino',
            'sector' => 'publica',
            'colonia' => 'Sánchez Taboada',
            'address' => 'Calle 1 #100',
            'contact_name' => 'Laura Pérez',
        ]);
        $school->user_id = $user->id;
        $school->families_informed_at = now();
        $school->status = $status;
        $school->save();

        return $user->fresh();
    }
}
