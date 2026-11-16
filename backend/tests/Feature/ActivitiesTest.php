<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\Catalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ActivitiesTest extends TestCase
{
    use RefreshDatabase;

    private string $token;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        Catalog::sync();
        $school = $this->school();
        $teacher = new Teacher(['name' => 'Laura']);
        $teacher->school_id = $school->school->id;
        $teacher->save();
        $classroom = new Classroom(['name' => '5° A', 'grade' => '5°']);
        $classroom->teacher_id = $teacher->id;
        $classroom->school_year = Classroom::currentSchoolYear();
        $classroom->code = Classroom::newCode();
        $classroom->save();
        $this->student = new Student(['name' => 'Ana']);
        $this->student->classroom_id = $classroom->id;
        $this->student->name_key = 'ana';
        $this->student->assignReturnCode();
        $this->student->save();
        $this->token = bin2hex(random_bytes(32));
        DB::table('device_sessions')->insert([
            'kind' => 'student', 'owner_id' => $this->student->id, 'token_hash' => hash('sha256', $this->token),
            'last_used_on' => now()->toDateString(), 'expires_at' => now()->addDays(400), 'created_at' => now(),
        ]);
    }

    private function asStudent(): static
    {
        return $this->withCredentials()->withUnencryptedCookie('cc_alumno', $this->token);
    }

    public function test_catalogo_publico_sin_respuestas(): void
    {
        $response = $this->getJson('/api/actividades')->assertOk();
        $activities = collect($response->json('activities'));
        $this->assertSame('lectura-conozca', $activities->first()['key']);
        $this->assertSame(10, $activities->firstWhere('key', 'lectura-conozca')['points']);
        $this->assertCount(3, $activities->firstWhere('key', 'lectura-conozca')['question']['options']);
        $this->assertStringNotContainsString('answer', $response->getContent());
    }

    public function test_sincronizar_desactiva_lo_que_ya_no_esta_y_conserva_puntos(): void
    {
        $id = DB::table('activities')->where('key', 'mochila')->value('id');
        DB::table('completions')->insert(['student_id' => $this->student->id, 'activity_id' => $id, 'points' => 20, 'completed_at' => now()]);
        config(['activities' => array_values(array_filter(config('activities'), fn ($a) => $a['key'] !== 'mochila'))]);
        Catalog::sync();
        $this->assertFalse((bool) DB::table('activities')->where('key', 'mochila')->value('active'));
        $this->asStudent()->getJson('/api/yo')->assertJsonPath('progress.points', 20);
    }

    public function test_lectura_con_pregunta_suma_una_sola_vez(): void
    {
        $this->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])->assertUnauthorized();
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 2])
            ->assertUnprocessable()->assertJsonPath('reason', 'incorrecta');
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])
            ->assertOk()->assertJsonPath('new', true)->assertJsonPath('points', 10)->assertJsonPath('total', 10);
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])
            ->assertOk()->assertJsonPath('new', false)->assertJsonPath('total', 10);
        $this->assertSame(1, DB::table('completions')->count());
        $this->asStudent()->getJson('/api/yo')->assertJsonPath('progress.completed', ['lectura-conozca']);
    }

    public function test_juego_propio_necesita_inicio_y_tiempo_minimo(): void
    {
        $this->asStudent()->postJson('/api/actividades/mochila/terminar')->assertUnprocessable()->assertJsonPath('reason', 'sin-inicio');
        $this->asStudent()->postJson('/api/actividades/mochila/inicio')->assertOk();
        $this->asStudent()->postJson('/api/actividades/mochila/terminar')->assertUnprocessable()->assertJsonPath('reason', 'muy-rapido');
        $this->travel(46)->seconds();
        $this->asStudent()->postJson('/api/actividades/mochila/terminar')->assertOk()->assertJsonPath('points', 20);
        // El segundo aviso no vuelve a sumar.
        $this->asStudent()->postJson('/api/actividades/mochila/terminar')->assertOk()->assertJsonPath('new', false);
        $this->assertSame(20, (int) DB::table('completions')->sum('points'));
    }

    public function test_un_inicio_reciente_no_reinicia_la_cuenta(): void
    {
        $this->asStudent()->postJson('/api/actividades/mision-tijuana/inicio')->assertOk();
        $this->travel(100)->seconds();
        $this->asStudent()->postJson('/api/actividades/mision-tijuana/inicio')->assertOk();
        $this->travel(30)->seconds();
        $this->asStudent()->postJson('/api/actividades/mision-tijuana/terminar')->assertOk();
    }

    public function test_juego_externo_muy_rapido_a_tiempo_y_muy_tarde(): void
    {
        $this->asStudent()->postJson('/api/actividades/alerta-911/inicio')->assertOk();
        $this->travel(60)->seconds();
        $this->asStudent()->postJson('/api/actividades/alerta-911/respuesta', ['answer' => 1])->assertUnprocessable()->assertJsonPath('reason', 'muy-rapido');
        $this->travel(4)->hours();
        $this->asStudent()->postJson('/api/actividades/alerta-911/respuesta', ['answer' => 1])->assertUnprocessable()->assertJsonPath('reason', 'muy-tarde');
        $this->asStudent()->postJson('/api/actividades/alerta-911/inicio')->assertOk();
        $this->travel(5)->minutes();
        $this->asStudent()->postJson('/api/actividades/alerta-911/respuesta', ['answer' => 0])->assertUnprocessable()->assertJsonPath('reason', 'incorrecta');
        $this->asStudent()->postJson('/api/actividades/alerta-911/respuesta', ['answer' => 1])->assertOk()->assertJsonPath('points', 10);
    }

    public function test_modos_equivocados_y_actividades_inexistentes(): void
    {
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/terminar')->assertNotFound();
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/inicio')->assertNotFound();
        $this->asStudent()->postJson('/api/actividades/mochila/respuesta', ['answer' => 0])->assertNotFound();
        $this->asStudent()->postJson('/api/actividades/no-existe/terminar')->assertNotFound();
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 'x'])->assertUnprocessable();
    }

    public function test_un_alumno_no_suma_por_otro(): void
    {
        $this->asStudent()->postJson('/api/actividades/lectura-mochila/respuesta', ['answer' => 2])->assertOk();
        $this->assertSame(0, DB::table('completions')->where('student_id', '!=', $this->student->id)->count());
        $this->withCredentials()->withUnencryptedCookie('cc_alumno', str_repeat('a', 64))->getJson('/api/yo')->assertJsonPath('progress', null);
    }
}
