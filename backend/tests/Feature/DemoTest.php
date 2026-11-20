<?php

namespace Tests\Feature;

use App\Support\DemoData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DemoTest extends TestCase
{
    use RefreshDatabase;

    private function withDemo(): void
    {
        config(['demo.enabled' => true]);
    }

    public function test_apagada_no_existe(): void
    {
        $this->getJson('/api/demo')->assertNotFound();
        $this->postJson('/api/demo/entrar/admin')->assertNotFound();
    }

    public function test_el_seeder_no_duplica_y_se_borra_todo(): void
    {
        DemoData::seed();
        DemoData::seed();
        $this->assertSame(3, DB::table('users')->where('email', 'like', '%@demo-20nov.invalid')->count());
        $this->assertSame(2, DB::table('schools')->count());
        $this->assertSame(2, DB::table('schools')->where('status', 'approved')->count());
        $this->assertSame(2, DB::table('classrooms')->count());
        $this->assertSame(6, DB::table('students')->count());
        $this->assertGreaterThan(0, DB::table('completions')->count());
        $this->assertSame(77, (int) DB::table('visit_zones')->sum('visits'));
        $this->assertNotEmpty(DB::table('students')->first()->wallet);

        // Una visita real no se borra con la demo
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tijuana', 'zona' => 'Playas'])->assertOk();
        $this->artisan('demo:borrar')->assertSuccessful();
        $this->assertSame(0, DB::table('users')->count());
        $this->assertSame(0, DB::table('schools')->count());
        $this->assertSame(0, DB::table('students')->count());
        $this->assertSame(1, (int) DB::table('visit_zones')->sum('visits'));
    }

    public function test_entra_a_cada_rol_con_la_sesion_real(): void
    {
        DemoData::seed();
        $this->withDemo();
        $this->getJson('/api/demo')->assertOk()->assertJsonPath('ready', true)->assertJsonPath('classrooms.0.code', '201120');

        $this->postJson('/api/demo/entrar/admin')->assertOk();
        $this->getJson('/api/admin/estadisticas')->assertOk();
        $this->getJson('/api/admin/zonas')->assertOk()->assertJsonPath('municipios.0.name', 'Tijuana');

        $this->postJson('/api/demo/entrar/escuela')->assertOk();
        $this->getJson('/api/sesion')->assertJsonPath('user.role', 'school');

        $teacher = $this->postJson('/api/demo/entrar/profesor')->assertOk();
        $this->withCredentials()->withUnencryptedCookie('cc_docente', $teacher->getCookie('cc_docente', false)->getValue())
            ->getJson('/api/docente')->assertOk()->assertJsonPath('teacher.name', 'Profe Demo');

        $student = $this->postJson('/api/demo/entrar/alumno')->assertOk();
        $this->withCredentials()->withUnencryptedCookie('cc_alumno', $student->getCookie('cc_alumno', false)->getValue())
            ->getJson('/api/yo')->assertOk()->assertJsonPath('student.name', 'Ana Demo');

        $this->postJson('/api/demo/entrar/nadie')->assertNotFound();
        $this->postJson('/api/demo/salir')->assertOk();
    }

    public function test_el_panel_enciende_y_apaga_la_demo_y_se_apaga_sola(): void
    {
        $admin = $this->admin();
        $this->getJson('/api/demo')->assertNotFound();
        $this->actingAs($admin)->postJson('/api/admin/sistema/demo', ['accion' => 'encender', 'confirm' => 'si'])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/admin/sistema/demo', ['accion' => 'encender', 'confirm' => 'ENCENDER'])->assertOk()->assertJsonPath('on', true);
        $this->getJson('/api/demo')->assertOk()->assertJsonPath('ready', true);
        $this->actingAs($admin)->getJson('/api/admin/sistema')->assertJsonPath('demo.on', true);
        $this->assertNotNull(DB::table('settings')->where('key', 'demo20nov.hasta')->value('value'));

        // A las 24 horas se apaga sola y borra todo lo demo
        $this->travel(25)->hours();
        $this->actingAs($admin)->getJson('/api/admin/sistema')->assertJsonPath('demo.on', false);
        $this->assertSame(0, DB::table('users')->where('email', 'like', '%@demo-20nov.invalid')->count());
        \App\Support\Settings::forget();
        $this->getJson('/api/demo')->assertNotFound();

        $this->actingAs($admin)->postJson('/api/admin/sistema/demo', ['accion' => 'encender', 'confirm' => 'encender'])->assertOk();
        $this->actingAs($admin)->postJson('/api/admin/sistema/demo', ['accion' => 'apagar', 'confirm' => 'APAGAR'])->assertOk()->assertJsonPath('on', false);
        $this->assertSame(0, DB::table('schools')->count());
    }

    public function test_la_cuenta_demo_no_toca_datos_reales(): void
    {
        $real = $this->school();
        $realAdmin = $this->admin();
        DemoData::seed();
        $demoAdmin = DemoData::user('admin');
        foreach (['/api/admin/respaldo', '/api/admin/respaldos', '/api/admin/usuarios', '/api/admin/bitacora', '/api/admin/ajustes'] as $url) {
            $this->actingAs($demoAdmin)->getJson($url)->assertForbidden();
        }
        $this->actingAs($demoAdmin)->postJson('/api/admin/usuarios', ['name' => 'X', 'email' => 'x@x.mx', 'role' => 'admin'])->assertForbidden();
        $this->actingAs($demoAdmin)->deleteJson("/api/admin/usuarios/{$realAdmin->id}")->assertForbidden();
        $this->actingAs($demoAdmin)->postJson('/api/admin/sistema/demo', ['accion' => 'apagar', 'confirm' => 'APAGAR'])->assertForbidden();
        $this->actingAs($demoAdmin)->postJson('/api/admin/catalogo-escuelas', ['schools' => []])->assertForbidden();
        // Escuelas reales: ni verlas ni cambiarlas
        $id = $real->school->id;
        $this->actingAs($demoAdmin)->getJson("/api/admin/escuelas/{$id}")->assertForbidden();
        $this->actingAs($demoAdmin)->postJson("/api/admin/escuelas/{$id}/suspender", ['reason' => 'Prueba de la demo'])->assertForbidden();
        $this->actingAs($demoAdmin)->putJson("/api/admin/escuelas/{$id}/correo", ['email' => 'otro@x.mx'])->assertForbidden();
        $this->actingAs($demoAdmin)->postJson("/api/admin/escuelas/{$id}/codigos")->assertForbidden();
        $this->assertSame('approved', $real->school->fresh()->status);
        $list = $this->actingAs($demoAdmin)->getJson('/api/admin/escuelas')->assertOk()->json('schools');
        $this->assertNotContains($id, array_column($list, 'id'));
        // Las escuelas demo sí
        $demoSchool = DemoData::user('escuela')->school;
        $this->actingAs($demoAdmin)->postJson("/api/admin/escuelas/{$demoSchool->id}/suspender", ['reason' => 'Prueba de la demo'])->assertOk();
        // Un admin real sí puede todo
        $this->actingAs($realAdmin)->getJson('/api/admin/usuarios')->assertOk();
        $this->actingAs($realAdmin)->getJson("/api/admin/escuelas/{$id}")->assertOk();
    }
}
