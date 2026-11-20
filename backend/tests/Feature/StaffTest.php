<?php

namespace Tests\Feature;

use App\Mail\Notice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    private function invite(User $admin, string $role = 'viewer', string $email = 'datos@uabc.edu.mx'): array
    {
        return $this->actingAs($admin)->postJson('/api/admin/usuarios', ['name' => 'Ana Datos', 'email' => $email, 'role' => $role])->assertCreated()->json();
    }

    public function test_invitar_cuenta_de_solo_lectura_y_aceptar(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $data = $this->invite($admin);
        $this->assertSame('viewer', $data['user']['role']);
        $this->assertFalse($data['user']['active']);
        Mail::assertSent(Notice::class, fn (Notice $m) => $m->hasTo('datos@uabc.edu.mx') && str_contains($m->actionUrl, '/invitacion?token='));
        $token = substr($data['link'], -64);
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/invitacion', ['token' => $token, 'password' => 'corta'])->assertUnprocessable();
        $this->postJson('/api/invitacion', ['token' => $token, 'password' => 'una frase muy larga'])->assertOk()->assertJsonPath('user.role', 'viewer')->assertJsonCount(10, 'recovery_codes');
        $this->postJson('/api/invitacion', ['token' => $token, 'password' => 'una frase muy larga'])->assertUnprocessable();
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/entrar', ['email' => 'datos@uabc.edu.mx', 'password' => 'una frase muy larga'])->assertOk();
    }

    public function test_solo_lectura_ve_datos_pero_no_cambia_nada(): void
    {
        $viewer = User::factory()->create(['role' => 'viewer']);
        $school = $this->school();
        $this->actingAs($viewer)->getJson('/api/admin/estadisticas')->assertOk();
        $this->actingAs($viewer)->getJson('/api/admin/escuelas?estado=approved')->assertOk()->assertJsonCount(1, 'schools');
        $this->actingAs($viewer)->getJson('/api/admin/catalogo-escuelas')->assertOk();
        $this->actingAs($viewer)->postJson("/api/admin/escuelas/{$school->school->id}/suspender", ['reason' => 'Prueba de permisos'])->assertForbidden();
        $this->actingAs($viewer)->getJson('/api/admin/ajustes')->assertForbidden();
        $this->actingAs($viewer)->getJson('/api/admin/respaldo')->assertForbidden();
        $this->actingAs($viewer)->getJson('/api/admin/usuarios')->assertForbidden();
        $this->actingAs($viewer)->postJson('/api/admin/usuarios', ['name' => 'X', 'email' => 'x@x.mx', 'role' => 'admin'])->assertForbidden();
        $this->actingAs($this->school())->getJson('/api/admin/estadisticas')->assertForbidden();
    }

    public function test_cambiar_rol_y_quitar_acceso_sin_quedarse_sin_admin(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $other = User::factory()->create(['role' => 'viewer']);
        $this->actingAs($admin)->getJson('/api/admin/usuarios')->assertOk()->assertJsonCount(2, 'users');
        $this->actingAs($admin)->putJson("/api/admin/usuarios/{$admin->id}", ['role' => 'viewer'])->assertUnprocessable();
        $this->actingAs($admin)->putJson("/api/admin/usuarios/{$other->id}", ['role' => 'admin'])->assertOk()->assertJsonPath('user.role', 'admin');
        $this->actingAs($admin)->deleteJson("/api/admin/usuarios/{$admin->id}")->assertUnprocessable();
        $this->actingAs($admin)->deleteJson("/api/admin/usuarios/{$other->id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $other->id]);
        $school = $this->school();
        $this->actingAs($admin)->deleteJson("/api/admin/usuarios/{$school->id}")->assertNotFound();
        $this->actingAs($admin)->postJson('/api/admin/usuarios', ['name' => 'Y', 'email' => $school->email, 'role' => 'viewer'])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/admin/usuarios', ['name' => 'Y', 'email' => 'y@y.mx', 'role' => 'school'])->assertUnprocessable();
    }
}
