<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function row(array $extra = []): array
    {
        return array_merge([
            'cct' => '02DPB0007N',
            'name' => 'Juan José de los Reyes Martínez el Pípila',
            'level' => 'primaria',
            'level_detail' => 'indígena',
            'shift' => 'matutino',
            'sector' => 'publica',
            'colonia' => 'Obrera',
            'address' => 'Calle Manuel Félix Acosta',
            'postal_code' => '22001',
            'municipality' => 'Tijuana',
            'lat' => 32.497,
            'lng' => -117.08,
        ], $extra);
    }

    public function test_solo_el_admin_carga_el_catalogo(): void
    {
        $this->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row()]])->assertUnauthorized();
        $this->actingAs($this->school())->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row()]])->assertForbidden();
        $admin = $this->admin();
        $this->actingAs($admin)->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row(['municipality' => 'Tijuana, B.C.'])]])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row(['cct' => 'malo'])]])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/admin/catalogo-escuelas', ['first' => true, 'schools' => [$this->row(), $this->row(['cct' => '02EJN0100A', 'name' => 'Jardín de Niños Gabriela Mistral', 'level' => 'preescolar', 'municipality' => 'Playas de Rosarito'])]])
            ->assertOk()->assertJsonPath('total', 2);
        // Volver a cargar actualiza sin duplicar.
        $this->actingAs($admin)->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row(['name' => 'Escuela Pípila'])]])->assertOk()->assertJsonPath('total', 2);
        $this->actingAs($admin)->getJson('/api/admin/catalogo-escuelas')->assertOk()
            ->assertJsonPath('total', 2)->assertJsonPath('by_municipality.Tijuana', 1);
    }

    public function test_buscar_por_nombre_sin_acentos_colonia_o_cct(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row()]])->assertOk();
        $this->getJson('/api/catalogo-escuelas?q=p')->assertUnprocessable();
        $this->getJson('/api/catalogo-escuelas?q=ju')->assertOk()->assertJsonPath('schools.0.cct', '02DPB0007N');
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()->assertJsonPath('schools.0.cct', '02DPB0007N')->assertJsonPath('schools.0.registered', false);
        $this->getJson('/api/catalogo-escuelas?q=reyes obrera')->assertOk()->assertJsonCount(1, 'schools');
        $this->getJson('/api/catalogo-escuelas?q=02dpb0007n')->assertOk()->assertJsonPath('schools.0.name', 'Juan José de los Reyes Martínez el Pípila');
        $this->getJson('/api/catalogo-escuelas?q=secundaria')->assertOk()->assertJsonCount(0, 'schools');
    }

    public function test_acepta_los_siete_municipios_y_filtra_por_municipio(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [
            $this->row(),
            $this->row(['cct' => '02DPR0003C', 'name' => 'Benito Juárez', 'municipality' => 'Ensenada', 'lat' => 31.8667, 'lng' => -116.5964]),
            $this->row(['cct' => '02DPR0004D', 'name' => 'Benito Juárez', 'municipality' => 'San Quintín', 'lat' => 30.5603, 'lng' => -115.9386]),
            $this->row(['cct' => '02DPR0005E', 'name' => 'Benito Juárez', 'municipality' => 'San Felipe', 'lat' => 31.0256, 'lng' => -114.837]),
        ]])->assertOk()->assertJsonPath('total', 4);
        $this->getJson('/api/catalogo-escuelas?q=benito')->assertOk()->assertJsonCount(3, 'schools');
        $this->getJson('/api/catalogo-escuelas?q=benito&municipio=Ensenada')->assertOk()
            ->assertJsonCount(1, 'schools')->assertJsonPath('schools.0.cct', '02DPR0003C');
        $this->getJson('/api/catalogo-escuelas?q=benito&municipio=San Quintín')->assertOk()
            ->assertJsonPath('schools.0.cct', '02DPR0004D');
        // El nombre de las zonas también sirve: Rosarito es Playas de Rosarito en la SEP
        $this->getJson('/api/catalogo-escuelas?q=benito&municipio=Rosarito')->assertOk()->assertJsonCount(0, 'schools');
        $this->getJson('/api/catalogo-escuelas/cerca?lat=31.0256&lng=-114.837')->assertOk()->assertJsonPath('schools.0.cct', '02DPR0005E');
        $this->getJson('/api/catalogo-escuelas/cerca?cp=22001&municipio=Ensenada')->assertOk()->assertJsonCount(1, 'schools');
        // El punto de "sin ubicación" de la SEP en Mexicali no se guarda como ubicación
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [
            $this->row(['cct' => '02DPR0006F', 'name' => 'Cuauhtémoc', 'municipality' => 'Mexicali', 'lat' => 32.632, 'lng' => -115.47]),
        ]])->assertOk();
        $this->getJson('/api/catalogo-escuelas?q=cuauhtemoc&municipio=Mexicali')->assertOk()
            ->assertJsonPath('schools.0.lat', null)->assertJsonPath('schools.0.geo', null);
    }

    public function test_primero_las_que_empiezan_con_lo_escrito(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [
            $this->row(['cct' => '02DPR0001A', 'name' => 'Agustín Melgar', 'colonia' => 'Benito Juárez']),
            $this->row(['cct' => '02DPR0002B', 'name' => 'Benito Juárez', 'colonia' => 'Centro']),
        ]])->assertOk();
        $this->getJson('/api/catalogo-escuelas?q=benito')->assertOk()
            ->assertJsonPath('schools.0.name', 'Benito Juárez')
            ->assertJsonPath('schools.1.name', 'Agustín Melgar');
    }

    public function test_el_punto_de_la_sep_sin_ubicacion_no_se_usa(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [
            $this->row(),
            $this->row(['cct' => '02DPR0002B', 'name' => 'Benito Juárez', 'lat' => 32.527144, 'lng' => -117.020861]),
        ]])->assertOk();
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()
            ->assertJsonPath('schools.0.lat', null)->assertJsonPath('schools.0.lng', null);
        $this->getJson('/api/catalogo-escuelas?q=benito')->assertOk()
            ->assertJsonPath('schools.0.lat', 32.527144)->assertJsonPath('schools.0.lng', -117.020861)
            ->assertJsonPath('schools.0.geo', 'sep');
    }

    public function test_actualizar_sin_punto_conserva_el_que_tenia(): void
    {
        \App\Http\Controllers\SchoolCatalogController::save(\App\Http\Controllers\SchoolCatalogController::rows([
            $this->row(['lat' => 32.531, 'lng' => -117.012, 'geo' => 'inegi']),
        ]));
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row(['name' => 'Escuela Pípila'])]])->assertOk();
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()
            ->assertJsonPath('schools.0.name', 'Escuela Pípila')
            ->assertJsonPath('schools.0.lat', 32.531)->assertJsonPath('schools.0.geo', 'inegi');
    }

    public function test_escuelas_cercanas_y_por_codigo_postal(): void
    {
        \App\Http\Controllers\SchoolCatalogController::save(\App\Http\Controllers\SchoolCatalogController::rows([
            $this->row(['lat' => 32.531, 'lng' => -117.012, 'geo' => 'inegi']),
            // A unos 800 m
            $this->row(['cct' => '02DPR0002B', 'name' => 'Benito Juárez', 'postal_code' => '22002', 'lat' => 32.538, 'lng' => -117.012]),
            // A más de 5 km
            $this->row(['cct' => '02DPR0003C', 'name' => 'Lejana', 'postal_code' => '22002', 'lat' => 32.48, 'lng' => -117.012]),
            $this->row(['cct' => '02DPR0004D', 'name' => 'Sin punto', 'postal_code' => '22002', 'lat' => null, 'lng' => null]),
        ]));
        $this->getJson('/api/catalogo-escuelas/cerca?lat=32.5312&lng=-117.0121')->assertOk()
            ->assertJsonCount(2, 'schools')
            ->assertJsonPath('schools.0.cct', '02DPB0007N')->assertJsonPath('schools.1.cct', '02DPR0002B');
        $this->getJson('/api/catalogo-escuelas/cerca?cp=22002')->assertOk()->assertJsonCount(2, 'schools');
        $this->getJson('/api/catalogo-escuelas/cerca')->assertUnprocessable();
        $this->getJson('/api/catalogo-escuelas/cerca?cp=00000')->assertUnprocessable();
        // El código postal sale en la búsqueda
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()->assertJsonPath('schools.0.postal_code', '22001');
    }

    public function test_marca_las_escuelas_ya_registradas(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row()]])->assertOk();
        $school = $this->school();
        $school->school->forceFill(['cct' => '02DPB0007N'])->save();
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()->assertJsonPath('schools.0.registered', true);
    }

    public function test_el_catalogo_incluido_se_carga_al_arrancar_y_se_busca_por_palabras(): void
    {
        // Lo carga el mismo comando que corre al arrancar el backend
        $this->artisan('actividades:sincronizar')->assertSuccessful();
        $total = \Illuminate\Support\Facades\DB::table('school_catalog')->count();
        $this->assertGreaterThan(2000, $total);
        // Al volver a arrancar no duplica ni vuelve a cargar
        $this->artisan('actividades:sincronizar')->assertSuccessful();
        $this->artisan('escuelas:catalogo --si-vacio')->expectsOutput('El catálogo de escuelas ya está cargado')->assertSuccessful();
        $this->assertSame($total, \Illuminate\Support\Facades\DB::table('school_catalog')->count());
        // Una escuela registrada con un CCT del catálogo se conserva al recargarlo a la fuerza
        $school = $this->school();
        $school->school->forceFill(['cct' => '02EPR0409H'])->save();
        $this->artisan('escuelas:catalogo')->assertSuccessful();
        $this->assertSame('02EPR0409H', $school->school->fresh()->cct);
        $this->assertSame($total, \Illuminate\Support\Facades\DB::table('school_catalog')->count());

        $ccts = fn (string $q) => collect($this->getJson('/api/catalogo-escuelas?q='.urlencode($q))->assertOk()->json('schools'))->pluck('cct')->all();
        foreach (['forjadores de baja california', 'FORJADORES BAJA', 'baja forjadores', 'escuela forjadores de baja california'] as $q) {
            $this->assertContains('02EPR0409H', $ccts($q), $q);
            $this->assertContains('02DPR0908E', $ccts($q), $q);
        }
        // Sin acentos ni mayúsculas, y por colonia o nivel
        $this->assertContains('02EPR0409H', $ccts('forjadores florido'));
        $this->assertContains('02EPR0409H', $ccts('primaria forjadores'));
        $this->assertContains('02EPR0409H', $ccts('02epr0409h'));
        $this->assertNotEmpty($ccts('heroes de baja california'));
        $this->assertNotEmpty($ccts('nacion forjadores'));
    }
}
