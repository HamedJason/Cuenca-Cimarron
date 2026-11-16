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
        $csv = $this->as('cc_docente', $this->teacher)->get("/api/docente/grupos/{$this->classroom['id']}/avance.csv")->assertOk()->streamedContent();
        $this->assertStringContainsString('Alumno,"Qué es El Niño","Consejos: antes de la lluvia","Tareas hechas",Puntos', $csv);
        $this->assertStringContainsString('Ana,Sí,No,"1 de 2",20', $csv);
    }

    public function test_otro_docente_no_ve_ni_asigna(): void
    {
        $other = $this->teacherToken();
        $this->as('cc_docente', $other)->getJson("/api/docente/grupos/{$this->classroom['id']}/avance")->assertNotFound();
        $this->as('cc_docente', $other)->postJson("/api/docente/grupos/{$this->classroom['id']}/tareas", ['activities' => ['mochila']])->assertNotFound();
        $this->as('cc_docente', $other)->get("/api/docente/grupos/{$this->classroom['id']}/avance.csv")->assertNotFound();
    }
}
