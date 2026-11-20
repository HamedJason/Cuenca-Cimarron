<?php

namespace Tests\Feature;

use App\Models\Teacher;
use App\Support\Catalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AssignmentsTest extends TestCase
{
    use RefreshDatabase;

    private string $teacher;

    private array $classroom;

    protected function setUp(): void
    {
        parent::setUp();
        Catalog::sync();
        $this->teacher = $this->teacherToken();
        $this->classroom = $this->as('cc_docente', $this->teacher)->postJson('/api/docente/grupos', ['name' => '6° A', 'grade' => '6°'])->json('classroom');
    }

    private function teacherToken(): string
    {
        $school = $this->school();
        $teacher = new Teacher(['name' => 'Laura']);
        $teacher->school_id = $school->school->id;
        $teacher->save();
        $token = bin2hex(random_bytes(32));
        DB::table('device_sessions')->insert([
            'kind' => 'teacher', 'owner_id' => $teacher->id, 'token_hash' => hash('sha256', $token),
            'last_used_on' => now()->toDateString(), 'expires_at' => now()->addDays(400), 'created_at' => now(),
        ]);

        return $token;
    }

    private function as(string $cookie, string $token): static
    {
        $this->unencryptedCookies = [];

        return $this->withCredentials()->withUnencryptedCookie($cookie, $token);
    }

    private function join(string $name): string
    {
        $this->unencryptedCookies = [];

        return $this->postJson('/api/unirse', ['code' => $this->classroom['code'], 'name' => $name])->getCookie('cc_alumno', false)->getValue();
    }

    public function test_asignar_tareas_y_el_alumno_las_ve(): void
    {
        $url = "/api/docente/grupos/{$this->classroom['id']}/tareas";
        $this->as('cc_docente', $this->teacher)->postJson($url, ['activities' => ['inventada']])->assertUnprocessable();
        $this->as('cc_docente', $this->teacher)->postJson($url, ['activities' => ['lectura-conozca'], 'due_date' => '2020-01-01'])->assertUnprocessable();
        $this->as('cc_docente', $this->teacher)->postJson($url, ['activities' => ['lectura-conozca', 'mochila'], 'due_date' => now()->addWeek()->format('Y-m-d')])
            ->assertOk()->assertJsonCount(2, 'tasks');
        // Volver a asignar no duplica.
        $this->as('cc_docente', $this->teacher)->postJson($url, ['activities' => ['mochila']])->assertOk()->assertJsonCount(2, 'tasks');
        $student = $this->join('Ana');
        $this->as('cc_alumno', $student)->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])->assertOk();
        $tasks = $this->as('cc_alumno', $student)->getJson('/api/yo')->assertOk()->json('tasks');
        $this->assertSame(['lectura-conozca', 'mochila'], array_column($tasks, 'key'));
        $this->assertTrue($tasks[0]['done']);
        $this->assertFalse($tasks[1]['done']);
        $this->as('cc_docente', $this->teacher)->deleteJson("$url/mochila")->assertOk()->assertJsonCount(1, 'tasks');
    }

    public function test_tabla_de_avance_y_csv(): void
    {
        $this->as('cc_docente', $this->teacher)->postJson("/api/docente/grupos/{$this->classroom['id']}/tareas", ['activities' => ['lectura-conozca', 'consejo-antes']])->assertOk();
        $ana = $this->join('Ana');
        $this->join('Beto');
        $this->as('cc_alumno', $ana)->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])->assertOk();
        $this->as('cc_alumno', $ana)->postJson('/api/actividades/lectura-mochila/respuesta', ['answer' => 2])->assertOk();
        $table = $this->as('cc_docente', $this->teacher)->getJson("/api/docente/grupos/{$this->classroom['id']}/avance")->assertOk()->json();
        $ana = collect($table['students'])->firstWhere('name', 'Ana');
        $this->assertSame(['lectura-conozca'], $ana['done']);
        $this->assertSame(1, $ana['tasks_done']);
        $this->assertSame(20, $ana['points']);
        // Cimacoins ganadas: 20 puntos × 10, sin las 150 iniciales
        $this->assertSame(200, $ana['coins_earned']);
        $this->assertSame(0, collect($table['students'])->firstWhere('name', 'Beto')['coins_earned']);
        // Los premios suman y gastar en la tienda no baja lo ganado
        \App\Models\Student::where('name', 'Ana')->first()->forceFill(['wallet' => ['bonus' => 70, 'spent' => 500]])->save();
        $again = $this->as('cc_docente', $this->teacher)->getJson("/api/docente/grupos/{$this->classroom['id']}/avance")->json();
        $this->assertSame(270, collect($again['students'])->firstWhere('name', 'Ana')['coins_earned']);
        $csv = $this->as('cc_docente', $this->teacher)->get("/api/docente/grupos/{$this->classroom['id']}/avance.csv")->assertOk()->streamedContent();
        $this->assertStringContainsString('Alumno,"Qué es El Niño","Consejos: antes de la lluvia","Tareas hechas","Cimacoins ganadas"', $csv);
        $this->assertStringContainsString('Ana,Sí,No,"1 de 2",270', $csv);
    }

    public function test_otro_docente_no_ve_ni_asigna(): void
    {
        $other = $this->teacherToken();
        $this->as('cc_docente', $other)->getJson("/api/docente/grupos/{$this->classroom['id']}/avance")->assertNotFound();
        $this->as('cc_docente', $other)->postJson("/api/docente/grupos/{$this->classroom['id']}/tareas", ['activities' => ['mochila']])->assertNotFound();
        $this->as('cc_docente', $other)->get("/api/docente/grupos/{$this->classroom['id']}/avance.csv")->assertNotFound();
    }

    public function test_caminos_predeterminados_se_asignan_completos(): void
    {
        $url = "/api/docente/grupos/{$this->classroom['id']}/tareas";
        $paths = $this->as('cc_docente', $this->teacher)->getJson($url)->assertOk()->json('paths');
        $this->assertGreaterThanOrEqual(5, count($paths));
        $catalog = collect($this->as('cc_docente', $this->teacher)->getJson($url)->json('catalog'))->pluck('key')->all();
        foreach ($paths as $path) {
            $this->assertNotEmpty($path['activities']);
            $this->assertSame([], array_values(array_diff($path['activities'], $catalog)), "Camino {$path['key']} con actividades que no existen");
        }
        $plan = collect($paths)->firstWhere('key', 'plan-familiar');
        $this->as('cc_docente', $this->teacher)->postJson($url, ['activities' => $plan['activities']])->assertOk()
            ->assertJsonCount(count($plan['activities']), 'tasks');
    }

    public function test_docente_arma_su_cimarron_con_todo_desbloqueado(): void
    {
        $defaults = config('avatar.defaults');
        $group = array_key_first(array_filter($defaults, fn ($id, $g) => collect(config('avatar.items'))->keys()->filter(fn ($k) => str_starts_with($k, "{$g}/") && config("avatar.items")[$k] > 100)->isNotEmpty(), ARRAY_FILTER_USE_BOTH));
        $expensive = collect(config('avatar.items'))->filter(fn ($p, $k) => str_starts_with($k, "{$group}/") && $p > 100)->keys()->first();
        $id = explode('/', $expensive)[1];
        $this->as('cc_docente', $this->teacher)->putJson('/api/docente/cimarron', ['avatar' => [$group => $id]])->assertOk()->assertJsonPath("avatar.{$group}", $id);
        $this->as('cc_docente', $this->teacher)->putJson('/api/docente/cimarron', ['avatar' => [$group => 'no-existe']])->assertUnprocessable();
        // /api/yo dice que en este equipo hay un docente, con su cimarrón.
        $this->as('cc_docente', $this->teacher)->getJson('/api/yo')->assertOk()
            ->assertJsonPath('student', null)->assertJsonPath('teacher.name', 'Laura')->assertJsonPath("teacher.avatar.{$group}", $id);
        $this->unencryptedCookies = [];
        $this->getJson('/api/yo')->assertJsonPath('teacher', null);
    }

    public function test_lecturas_cortas_dan_puntos(): void
    {
        $student = $this->join('Ana');
        $this->as('cc_alumno', $student)->postJson('/api/actividades/modulo-riesgo-inundaciones/respuesta', ['answer' => 0])->assertUnprocessable();
        $this->as('cc_alumno', $student)->postJson('/api/actividades/modulo-riesgo-inundaciones/respuesta', ['answer' => 1])->assertOk()->assertJsonPath('points', 10);
        $modules = collect($this->getJson('/api/actividades')->json('activities'))->where('kind', 'modulo');
        $this->assertCount(11, $modules);
        $this->assertTrue($modules->every(fn ($m) => str_starts_with($m['route'], '/aprende/')));
    }
}
