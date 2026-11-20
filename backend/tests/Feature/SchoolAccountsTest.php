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

    public function test_la_huella_de_instalacion_es_la_nueva(): void
    {
        $huella = require base_path('config/instalacion.php');
        $this->assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $huella['clave_hash']);
        $this->assertSame('d4570669b4d046465d354de3566479108b7e3307265bfea7ac18f83e9cf766b5', $huella['clave_hash']);
        $this->assertNotSame('e00152516815bf08e08f807a0ce58e6ba52161411ae656e2cb89c0736a2ba290', $huella['clave_hash']);
    }

    public function test_configurar_crea_el_primer_admin_una_sola_vez(): void
    {
        $this->getJson('/api/sesion')->assertOk()->assertJson(['user' => null, 'setup_needed' => true]);
        $data = ['clave' => 'mala', 'name' => 'Jason', 'email' => 'admin@cuenca.mx', 'password' => 'una contraseña larga'];
        $this->postJson('/api/configurar', $data)->assertUnprocessable()->assertJsonValidationErrors('clave');
        config(['instalacion.clave_hash' => hash('sha256', 'CLAVE-BUENA')]);
        $data['clave'] = 'clave-buena';
        $this->withHeaders(['Origin' => 'https://cuencacimarrona.example.mx'])->postJson('/api/configurar', $data)->assertCreated()->assertJsonPath('user.role', 'admin');
        $this->assertSame('https://cuencacimarrona.example.mx', Settings::publicUrl());
        $this->getJson('/api/sesion')->assertJsonPath('setup_needed', false)->assertJsonPath('user.email', 'admin@cuenca.mx');
        $data['email'] = 'otro@cuenca.mx';
        $this->postJson('/api/configurar', $data)->assertStatus(409);
        $this->assertSame(10, \App\Support\RecoveryCodes::left(User::where('role', 'admin')->first()));
        $this->assertSame(1, User::where('role', 'admin')->count());
    }

    public function test_registro_de_escuela_tiene_acceso_inmediato_y_recibe_codigos(): void
    {
        Mail::fake();
        $response = $this->postJson('/api/escuelas', $this->registration())->assertCreated()
            ->assertJsonPath('user.school.status', 'approved')
            ->assertJsonPath('user.school.cct', '02DST0045K')
            ->assertJsonPath('user.email', 'directora@escuela.mx')
            ->assertJsonPath('user.recovery_codes_left', 10)
            ->assertJsonCount(10, 'recovery_codes');
        $this->assertMatchesRegularExpression('/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/', $response->json('recovery_codes.0'));
        // El sitio ya no manda correos.
        // Sin revisión: puede dar de alta docentes de inmediato
        $this->actingAs(User::where('email', 'directora@escuela.mx')->first())->postJson('/api/escuela/docentes', ['name' => 'Laura'])->assertCreated();
        Mail::assertNothingSent();
        $this->assertDatabaseHas('audit_logs', ['action' => 'registro']);
    }

    public function test_registro_rechaza_datos_invalidos(): void
    {
        $this->postJson('/api/escuelas', $this->registration([
            'cct' => '123', 'level' => 'universidad', 'password' => 'corta', 'privacy' => false, 'email' => 'no-es-correo', 'lat' => 10,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['cct', 'level', 'password', 'privacy', 'email', 'lat']);
        $this->assertDatabaseCount('schools', 0);
    }

    public function test_cct_y_correo_no_se_repiten_y_la_cct_se_pide_salvo_que_no_la_sepan(): void
    {
        $this->postJson('/api/escuelas', $this->registration())->assertCreated();
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/escuelas', $this->registration(['email' => 'otra@escuela.mx']))->assertUnprocessable()->assertJsonValidationErrors('cct');
        $this->postJson('/api/escuelas', $this->registration(['cct' => '']))->assertUnprocessable()->assertJsonValidationErrors(['email', 'cct']);
        // Sin CCT solo si marcan que no la saben
        $this->postJson('/api/escuelas', $this->registration(['cct' => '', 'email' => 'otra@escuela.mx']))->assertUnprocessable()->assertJsonValidationErrors('cct');
        $this->postJson('/api/escuelas', $this->registration(['cct' => '', 'sin_cct' => true, 'email' => 'otra@escuela.mx']))->assertCreated()->assertJsonPath('user.school.cct', null);
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/escuelas', $this->registration(['cct' => '02X', 'email' => 'tercera@escuela.mx']))->assertUnprocessable()->assertJsonValidationErrors('cct');
    }

    public function test_escuela_del_catalogo_guarda_cct_y_ubicacion_del_catalogo(): void
    {
        \App\Http\Controllers\SchoolCatalogController::loadBundled();
        // Elegida del buscador pero sin tocar el mapa: la ubicación sale del catálogo
        $this->postJson('/api/escuelas', $this->registration(['cct' => '02epr0409h', 'name' => 'Forjadores de Baja California', 'lat' => null, 'lng' => null]))
            ->assertCreated()->assertJsonPath('user.school.cct', '02EPR0409H');
        $school = \App\Models\School::where('cct', '02EPR0409H')->first();
        $catalog = \Illuminate\Support\Facades\DB::table('school_catalog')->where('cct', '02EPR0409H')->first();
        $this->assertEqualsWithDelta((float) $catalog->lat, $school->lat, 0.00001);
        $this->assertEqualsWithDelta((float) $catalog->lng, $school->lng, 0.00001);
        // En el panel de datos sale su municipio
        $school->forceFill(['status' => 'approved'])->save();
        $this->actingAs($this->admin())->getJson('/api/admin/estadisticas')->assertOk()->assertJsonPath('schools.0.municipality', 'Tijuana');
    }

    public function test_sin_cct_el_municipio_sale_de_la_ubicacion(): void
    {
        $user = $this->school();
        $user->school->forceFill(['cct' => null, 'lat' => 32.36, 'lng' => -117.05])->save();
        $this->actingAs($this->admin())->getJson('/api/admin/estadisticas')->assertOk()
            ->assertJsonPath('schools.0.municipality', 'Playas de Rosarito')
            ->assertJsonPath('municipalities.0.name', 'Playas de Rosarito');
    }

    public function test_contrasena_nueva_con_codigo_de_un_solo_uso(): void
    {
        $codes = $this->postJson('/api/escuelas', $this->registration())->assertCreated()->json('recovery_codes');
        $this->postJson('/api/salir')->assertOk();
        $this->app['auth']->forgetGuards();
        $data = ['email' => 'directora@escuela.mx', 'code' => 'AAAA-BBBB', 'password' => 'clave nueva y larga'];
        $this->postJson('/api/contrasena/codigo', $data)->assertUnprocessable()->assertJsonValidationErrors('code');
        $data['code'] = strtolower(str_replace('-', ' ', $codes[3]));
        $this->postJson('/api/contrasena/codigo', $data)->assertOk()->assertJsonPath('codes_left', 9)->assertJsonPath('user.recovery_codes_left', 9);
        $this->postJson('/api/contrasena/codigo', $data)->assertUnprocessable();
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/entrar', ['email' => 'directora@escuela.mx', 'password' => 'clave nueva y larga'])->assertOk();
    }

    public function test_codigo_de_otra_cuenta_no_sirve_y_se_bloquea(): void
    {
        $codes = $this->postJson('/api/escuelas', $this->registration())->assertCreated()->json('recovery_codes');
        $other = $this->school();
        $this->postJson('/api/salir')->assertOk();
        $this->postJson('/api/contrasena/codigo', ['email' => $other->email, 'code' => $codes[0], 'password' => 'clave nueva y larga'])->assertUnprocessable();
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/contrasena/codigo', ['email' => 'directora@escuela.mx', 'code' => 'ZZZZ-ZZZZ', 'password' => 'clave nueva y larga'])->assertUnprocessable();
        }
        $this->postJson('/api/contrasena/codigo', ['email' => 'directora@escuela.mx', 'code' => $codes[0], 'password' => 'clave nueva y larga'])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_generar_codigos_nuevos_pide_la_contrasena(): void
    {
        $user = $this->school();
        $this->actingAs($user)->postJson('/api/codigos-recuperacion', ['password' => 'mala'])->assertUnprocessable();
        $codes = $this->actingAs($user)->postJson('/api/codigos-recuperacion', ['password' => 'password'])->assertOk()->json('recovery_codes');
        $this->assertCount(10, $codes);
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/salir');
        $this->postJson('/api/codigos-recuperacion', ['password' => 'password'])->assertUnauthorized();
    }

    public function test_entrar_y_salir(): void
    {
        $user = $this->school();
        $this->postJson('/api/entrar', ['email' => $user->email, 'password' => 'incorrecta'])->assertUnprocessable();
        $this->postJson('/api/entrar', ['email' => strtoupper($user->email), 'password' => 'password'])->assertOk()->assertJsonPath('user.school.status', 'approved');
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
        $school = $this->school();
        $this->getJson('/api/admin/escuelas')->assertUnauthorized();
        $this->actingAs($school)->getJson('/api/admin/escuelas')->assertForbidden();
        $this->actingAs($school)->putJson('/api/admin/ajustes', ['domain' => 'x.mx'])->assertForbidden();
    }

    public function test_lista_de_escuelas_paginada_con_buscador(): void
    {
        $admin = $this->admin();
        for ($i = 1; $i <= 25; $i++) {
            $user = $this->school();
            $user->school->forceFill(['name' => "Primaria Número {$i}", 'colonia' => $i === 7 ? 'Cañón del Sáinz' : 'Centro'])->save();
        }
        $suspended = $this->school('suspended');
        $page = $this->actingAs($admin)->getJson('/api/admin/escuelas?estado=approved&por=5')->assertOk()
            ->assertJsonCount(5, 'schools')->assertJsonPath('total', 25)->assertJsonPath('more', true)
            ->assertJsonPath('counts.approved', 25)->assertJsonPath('counts.suspended', 1);
        $this->actingAs($admin)->getJson('/api/admin/escuelas?estado=approved&pagina=2')->assertOk()
            ->assertJsonCount(5, 'schools')->assertJsonPath('more', false);
        // Sin acentos ni mayúsculas, por nombre, colonia o correo
        $this->actingAs($admin)->getJson('/api/admin/escuelas?q=NUMERO 12')->assertOk()->assertJsonPath('schools.0.name', 'Primaria Número 12');
        $this->actingAs($admin)->getJson('/api/admin/escuelas?q=canon sainz')->assertOk()->assertJsonCount(1, 'schools');
        $this->actingAs($admin)->getJson('/api/admin/escuelas?q='.urlencode($suspended->email))->assertOk()->assertJsonCount(1, 'schools');
        // Ya no hay aprobar ni rechazar
        $id = $suspended->school->id;
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$id}/aprobar")->assertNotFound();
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$id}/rechazar")->assertNotFound();
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
