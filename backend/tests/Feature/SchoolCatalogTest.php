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
        $this->actingAs($admin)->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row(['municipality' => 'Ensenada'])]])->assertUnprocessable();
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
        $this->getJson('/api/catalogo-escuelas?q=pi')->assertUnprocessable();
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()->assertJsonPath('schools.0.cct', '02DPB0007N')->assertJsonPath('schools.0.registered', false);
        $this->getJson('/api/catalogo-escuelas?q=reyes obrera')->assertOk()->assertJsonCount(1, 'schools');
        $this->getJson('/api/catalogo-escuelas?q=02dpb0007n')->assertOk()->assertJsonPath('schools.0.name', 'Juan José de los Reyes Martínez el Pípila');
        $this->getJson('/api/catalogo-escuelas?q=secundaria')->assertOk()->assertJsonCount(0, 'schools');
    }

    public function test_marca_las_escuelas_ya_registradas(): void
    {
        $this->actingAs($this->admin())->postJson('/api/admin/catalogo-escuelas', ['schools' => [$this->row()]])->assertOk();
        $school = $this->school();
        $school->school->forceFill(['cct' => '02DPB0007N'])->save();
        $this->getJson('/api/catalogo-escuelas?q=pipila')->assertOk()->assertJsonPath('schools.0.registered', true);
    }
}
