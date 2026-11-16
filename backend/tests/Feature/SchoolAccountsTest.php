<?php

namespace Tests\Feature;

use App\Mail\Notice;
use App\Models\User;
use App\Support\Settings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SchoolAccountsTest extends TestCase
{
    use RefreshDatabase;

    private function registration(array $extra = []): array
    {
        return array_merge([
            'name' => 'Secundaria Técnica 45',
            'cct' => '02dst0045k',
            'level' => 'secundaria',
            'shift' => 'vespertino',
            'sector' => 'publica',
            'colonia' => 'Camino Verde',
            'address' => 'Av. Cañón del Matadero 200',
            'lat' => 32.48,
            'lng' => -116.98,
            'contact_name' => 'Ana López',
            'email' => 'Directora@Escuela.mx',
            'password' => 'una contraseña larga',
            'privacy' => true,
            'families_informed' => true,
        ], $extra);
    }

    private function tokenFrom(Notice $mail): string
    {
        return substr($mail->actionUrl, -64);
    }

    public function test_configurar_crea_el_primer_admin_una_sola_vez(): void
    {
        $this->getJson('/api/sesion')->assertOk()->assertJson(['user' => null, 'setup_needed' => true]);
        $data = ['clave' => 'mala', 'name' => 'Jason', 'email' => 'admin@cuenca.mx', 'password' => 'una contraseña larga'];
        $this->postJson('/api/configurar', $data)->assertUnprocessable()->assertJsonValidationErrors('clave');
        config(['instalacion.clave_hash' => hash('sha256', 'CLAVE-BUENA')]);
        $data['clave'] = 'clave-buena';
        $this->postJson('/api/configurar', $data)->assertCreated()->assertJsonPath('user.role', 'admin');
        $this->getJson('/api/sesion')->assertJsonPath('setup_needed', false)->assertJsonPath('user.email', 'admin@cuenca.mx');
        $data['email'] = 'otro@cuenca.mx';
        $this->postJson('/api/configurar', $data)->assertStatus(409);
        $this->assertSame(1, User::where('role', 'admin')->count());
    }

    public function test_registro_de_escuela_queda_pendiente_y_manda_confirmacion(): void
    {
        Mail::fake();
        $this->postJson('/api/escuelas', $this->registration())->assertCreated()
            ->assertJsonPath('user.school.status', 'pending')
            ->assertJsonPath('user.school.cct', '02DST0045K')
            ->assertJsonPath('user.email', 'directora@escuela.mx')
            ->assertJsonPath('user.email_verified', false);
        Mail::assertSent(Notice::class, fn (Notice $mail) => $mail->hasTo('directora@escuela.mx') && str_contains($mail->actionUrl, '/#/escuelas/confirmar?token='));
        $this->assertDatabaseHas('audit_logs', ['action' => 'registro']);
    }

    public function test_registro_rechaza_datos_invalidos(): void
    {
        $this->postJson('/api/escuelas', $this->registration([
            'cct' => '123', 'level' => 'universidad', 'password' => 'corta', 'privacy' => false, 'email' => 'no-es-correo', 'lat' => 10,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['cct', 'level', 'password', 'privacy', 'email', 'lat']);
        $this->assertDatabaseCount('schools', 0);
    }

    public function test_cct_y_correo_no_se_repiten_y_la_cct_es_opcional(): void
    {
        $this->postJson('/api/escuelas', $this->registration())->assertCreated();
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/escuelas', $this->registration(['email' => 'otra@escuela.mx']))->assertUnprocessable()->assertJsonValidationErrors('cct');
        $this->postJson('/api/escuelas', $this->registration(['cct' => '']))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/escuelas', $this->registration(['cct' => '', 'email' => 'otra@escuela.mx']))->assertCreated()->assertJsonPath('user.school.cct', null);
    }

    public function test_confirmar_correo_con_token_de_un_solo_uso(): void
    {
        Mail::fake();
        $this->postJson('/api/escuelas', $this->registration())->assertCreated();
        $token = null;
        Mail::assertSent(Notice::class, function (Notice $mail) use (&$token) {
            $token = $this->tokenFrom($mail);

            return true;
        });
        $this->postJson('/api/correo/confirmar', ['token' => $token])->assertOk();
        $this->postJson('/api/correo/confirmar', ['token' => $token])->assertUnprocessable();
        $this->getJson('/api/sesion')->assertJsonPath('user.email_verified', true);
    }

    public function test_entrar_y_salir(): void
    {
        $user = $this->school('pending');
        $this->postJson('/api/entrar', ['email' => $user->email, 'password' => 'incorrecta'])->assertUnprocessable();
        $this->postJson('/api/entrar', ['email' => strtoupper($user->email), 'password' => 'password'])->assertOk()->assertJsonPath('user.school.status', 'pending');
        $this->postJson('/api/salir')->assertOk();
        $this->getJson('/api/sesion')->assertJsonPath('user', null);
    }

    public function test_entrar_se_bloquea_tras_muchos_intentos(): void
    {
        $user = $this->school();
        for ($i = 0; $i < 8; $i++) {
            $this->postJson('/api/entrar', ['email' => $user->email, 'password' => 'incorrecta'])->assertUnprocessable();
        }
        $this->postJson('/api/entrar', ['email' => $user->email, 'password' => 'password'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_recuperar_contrasena(): void
    {
        Mail::fake();
        $user = $this->school();
        $this->postJson('/api/contrasena/olvide', ['email' => 'nadie@escuela.mx'])->assertOk();
        Mail::assertNothingSent();
        $this->postJson('/api/contrasena/olvide', ['email' => $user->email])->assertOk();
        $token = null;
        Mail::assertSent(Notice::class, function (Notice $mail) use (&$token) {
            $token = $this->tokenFrom($mail);

            return true;
        });
        $this->postJson('/api/contrasena/nueva', ['token' => $token, 'password' => 'otra contraseña larga'])->assertOk();
        $this->postJson('/api/contrasena/nueva', ['token' => $token, 'password' => 'otra contraseña larga'])->assertUnprocessable();
        $this->postJson('/api/entrar', ['email' => $user->email, 'password' => 'otra contraseña larga'])->assertOk();
    }

    public function test_permisos_de_admin(): void
    {
        $school = $this->school('pending');
        $this->getJson('/api/admin/escuelas')->assertUnauthorized();
        $this->actingAs($school)->getJson('/api/admin/escuelas')->assertForbidden();
        $this->actingAs($school)->putJson('/api/admin/ajustes', ['domain' => 'x.mx'])->assertForbidden();
    }

    public function test_admin_aprueba_y_rechaza_escuelas(): void
    {
        Mail::fake();
        $pending = $this->school('pending');
        $other = $this->school('pending');
        $admin = $this->admin();
        $this->actingAs($admin)->getJson('/api/admin/escuelas?estado=pending')->assertOk()->assertJsonCount(2, 'schools');
        $id = $pending->school->id;
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$id}/aprobar", ['cct' => 'xx'])->assertUnprocessable();
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$id}/aprobar", ['cct' => '02DPR0123X'])->assertOk()
            ->assertJsonPath('school.status', 'approved')->assertJsonPath('school.cct', '02DPR0123X');
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$other->school->id}/rechazar", ['reason' => 'No es una escuela de Tijuana'])
            ->assertOk()->assertJsonPath('school.status', 'rejected');
        Mail::assertSent(Notice::class, 2);
        $this->assertDatabaseHas('audit_logs', ['action' => 'aprobar-escuela', 'subject_id' => $id]);
    }

    public function test_escuela_rechazada_corrige_y_vuelve_a_revision(): void
    {
        $user = $this->school('rejected');
        $data = $user->school->only(['name', 'level', 'shift', 'sector', 'colonia', 'address', 'contact_name']);
        $data['name'] = 'Primaria Benito Juárez turno matutino';
        $this->actingAs($user)->putJson('/api/escuela', $data)->assertOk()->assertJsonPath('user.school.status', 'pending');
    }

    public function test_ajustes_de_correo_y_dominio(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $this->actingAs($admin)->postJson('/api/admin/ajustes/correo-prueba')->assertUnprocessable();
        $this->actingAs($admin)->putJson('/api/admin/ajustes', ['domain' => 'no valido'])->assertUnprocessable();
        $this->actingAs($admin)->putJson('/api/admin/ajustes', [
            'domain' => 'Cuenca.Ejemplo.MX', 'mail_host' => 'smtp-relay.brevo.com', 'mail_port' => 587,
            'mail_username' => 'cuenca@ejemplo.mx', 'mail_password' => 'secreto', 'mail_encryption' => 'tls',
        ])->assertOk()
            ->assertJsonPath('settings.domain', 'cuenca.ejemplo.mx')
            ->assertJsonPath('settings.mail_password_set', true)
            ->assertJsonPath('settings.effective_url', 'https://cuenca.ejemplo.mx')
            ->assertJsonMissing(['mail_password' => 'secreto']);
        $this->assertNotSame('secreto', DB::table('settings')->where('key', 'mail_password')->value('value'));
        // Guardar sin contraseña no borra la que ya estaba.
        $this->actingAs($admin)->putJson('/api/admin/ajustes', ['mail_port' => 2525])->assertOk();
        Settings::forget();
        $this->assertSame('secreto', Settings::get('mail_password'));
        $this->actingAs($admin)->postJson('/api/admin/ajustes/correo-prueba')->assertOk();
        Mail::assertSent(Notice::class, fn (Notice $mail) => $mail->hasTo($admin->email));
        $this->get('/api/tls/permitir?domain=cuenca.ejemplo.mx')->assertOk();
    }

    public function test_respaldo_con_clave(): void
    {
        $admin = $this->admin();
        $this->getJson('/api/respaldo')->assertForbidden();
        $key = $this->actingAs($admin)->postJson('/api/admin/respaldo/clave')->assertOk()->json('key');
        $this->assertSame(48, strlen($key));
        $this->getJson('/api/respaldo', ['X-Clave-Respaldo' => 'otra'])->assertForbidden();
        // En SQLite no hay pg_dump: la clave se acepta y se avisa que solo funciona con PostgreSQL.
        $response = $this->getJson('/api/respaldo', ['X-Clave-Respaldo' => $key]);
        $this->assertContains($response->getStatusCode(), [200, 422]);
        $this->actingAs($admin)->getJson('/api/admin/respaldos')->assertOk()->assertJsonStructure(['backups', 'folder_ready']);
        $this->actingAs($admin)->get('/api/admin/respaldos/..%2F..%2Fetc%2Fpasswd')->assertNotFound();
    }
}
