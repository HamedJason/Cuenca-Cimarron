<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class VisitZonesTest extends TestCase
{
    use RefreshDatabase;

    public function test_suma_la_zona_sin_guardar_ip_ni_coordenadas(): void
    {
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tijuana', 'zona' => 'Playas', 'fecha' => '2026-11-20'])->assertOk();
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tijuana', 'zona' => 'Playas'])->assertOk();
        $this->postJson('/api/visitas/zona', ['municipio' => 'Ensenada', 'zona' => 'Ensenada'])->assertOk();
        $this->assertSame(2, (int) DB::table('visit_zones')->where('zona', 'Playas')->value('visits'));
        $this->assertSame(['id', 'day', 'municipio', 'zona', 'visits'], array_keys((array) DB::table('visit_zones')->first()));
    }

    public function test_rechaza_zonas_que_no_existen_y_coordenadas(): void
    {
        $this->postJson('/api/visitas/zona', ['municipio' => 'Narnia', 'zona' => 'Narnia'])->assertUnprocessable();
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tijuana', 'zona' => 'Mi casa'])->assertUnprocessable();
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tecate', 'zona' => 'Playas'])->assertUnprocessable();
        $this->postJson('/api/visitas/zona', ['municipio' => 'Tijuana', 'zona' => '32.51,-117.03'])->assertUnprocessable();
        $this->assertSame(0, DB::table('visit_zones')->count());
    }

    public function test_tiene_limite_de_peticiones(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $this->postJson('/api/visitas/zona', ['municipio' => 'Mexicali', 'zona' => 'Mexicali'])->assertOk();
        }
        $this->postJson('/api/visitas/zona', ['municipio' => 'Mexicali', 'zona' => 'Mexicali'])->assertTooManyRequests();
    }

    public function test_el_panel_cuenta_por_municipio_y_delegacion_solo_para_admin(): void
    {
        foreach ([['Tijuana', 'Playas'], ['Tijuana', 'Playas'], ['Tijuana', 'Natura'], ['Rosarito', 'Rosarito']] as [$m, $z]) {
            $this->postJson('/api/visitas/zona', ['municipio' => $m, 'zona' => $z])->assertOk();
        }
        $this->getJson('/api/admin/zonas')->assertUnauthorized();
        $this->actingAs($this->admin())->getJson('/api/admin/zonas')->assertOk()
            ->assertJsonPath('total', 4)
            ->assertJsonPath('municipios.0', ['name' => 'Tijuana', 'visits' => 3])
            ->assertJsonPath('municipios.1', ['name' => 'Rosarito', 'visits' => 1])
            ->assertJsonPath('tijuana.0', ['name' => 'Playas', 'visits' => 2])
            ->assertJsonPath('tijuana.1', ['name' => 'Natura', 'visits' => 1]);
    }
}
