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

    public function test_cartera_inicial_y_puntos_que_dan_cimacoins(): void
    {
        $this->asStudent()->getJson('/api/yo')
            ->assertJsonPath('student.avatar.cabeza', 'casco-verde')
            ->assertJsonPath('student.wallet.coins', 150)
            ->assertJsonPath('student.wallet.extra', 150);
        // 10 puntos = 100 Cimacoins. Los puntos no cambian al comprar.
        $this->asStudent()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])->assertOk();
        $this->asStudent()->getJson('/api/yo')
            ->assertJsonPath('student.wallet.coins', 250)
            ->assertJsonPath('student.wallet.extra', 150);
        $this->asStudent()->postJson('/api/yo/cimacoins/compra', ['group' => 'ojos', 'id' => 'alegres'])
            ->assertOk()->assertJsonPath('wallet.coins', 230);
        $this->asStudent()->getJson('/api/yo')->assertJsonPath('progress.points', 10);
    }

    public function test_compras_validadas_en_el_servidor(): void
    {
        $buy = fn (array $body) => $this->asStudent()->postJson('/api/yo/cimacoins/compra', $body);
        $buy(['group' => 'ojos', 'id' => 'alegres'])->assertOk()->assertJsonPath('new', true)->assertJsonPath('wallet.coins', 130);
        // Comprar otra vez lo mismo no cobra.
        $buy(['group' => 'ojos', 'id' => 'alegres'])->assertOk()->assertJsonPath('new', false)->assertJsonPath('wallet.coins', 130);
        $buy(['group' => 'pelaje', 'id' => 'menta'])->assertUnprocessable();
        // Las piezas de premio no se venden.
        $buy(['group' => 'espalda', 'id' => 'mochila'])->assertUnprocessable();
        $buy(['group' => 'ojos', 'id' => 'no-existe'])->assertNotFound();
        $buy(['kit' => 'no-existe'])->assertNotFound();
        $buy([])->assertUnprocessable();
        $this->assertSame(['ojos/alegres'], $this->student->fresh()->wallet['owned']);
    }

    public function test_avatar_solo_con_piezas_propias(): void
    {
        $save = fn (array $avatar) => $this->asStudent()->putJson('/api/yo/cimarron', ['avatar' => $avatar]);
        $save(['ojos' => 'alegres'])->assertUnprocessable()->assertJsonValidationErrors('avatar');
        $save(['inventado' => 'x'])->assertUnprocessable();
        $this->asStudent()->postJson('/api/yo/cimacoins/compra', ['group' => 'ojos', 'id' => 'alegres'])->assertOk();
        $save(['ojos' => 'alegres', 'fondo' => 'cerro'])->assertOk()->assertJsonPath('avatar.ojos', 'alegres');
        $this->asStudent()->getJson('/api/yo')
            ->assertJsonPath('student.avatar.ojos', 'alegres')
            ->assertJsonPath('student.avatar.cabeza', 'casco-verde');
    }

    public function test_avatar_del_formato_anterior_queda_con_piezas_iniciales(): void
    {
        $this->student->avatar = ['background' => 'ocre', 'pieces' => ['casco']];
        $this->student->save();
        $this->asStudent()->getJson('/api/yo')->assertJsonPath('student.avatar.fondo', 'cerro');
    }

    public function test_premios_una_vez_y_diarios_una_vez_al_dia(): void
    {
        $claim = fn (string $id) => $this->asStudent()->postJson('/api/yo/cimacoins/premio', ['id' => $id]);
        $claim('moneda-conozca')->assertOk()->assertJsonPath('new', true)->assertJsonPath('wallet.coins', 180);
        $claim('moneda-conozca')->assertOk()->assertJsonPath('new', false)->assertJsonPath('wallet.coins', 180);
        $claim('mochila-lista')->assertOk()->assertJsonPath('wallet.owned', ['espalda/mochila']);
        $claim('no-existe')->assertNotFound();
        $claim('visita-diaria')->assertJsonPath('new', true);
        $claim('visita-diaria')->assertJsonPath('new', false);
        $this->travel(1)->days();
        $claim('visita-diaria')->assertJsonPath('new', true)->assertJsonPath('wallet.coins', 320);
    }

    public function test_kit_con_descuento(): void
    {
        $this->asStudent()->postJson('/api/yo/cimacoins/reto', ['id' => 'senal-radio'])->assertOk()->assertJsonPath('wallet.coins', 370);
        $this->asStudent()->postJson('/api/yo/cimacoins/reto', ['id' => 'senal-radio'])->assertJsonPath('new', false);
        $this->asStudent()->postJson('/api/yo/cimacoins/compra', ['kit' => 'futbolista'])
            ->assertOk()->assertJsonPath('price', 230)->assertJsonPath('wallet.coins', 140);
        $this->asStudent()->putJson('/api/yo/cimarron', ['avatar' => config('avatar.kits.futbolista')])->assertOk();
    }

    public function test_secreto_solo_con_los_tres_fragmentos(): void
    {
        $secret = fn (array $answer) => $this->asStudent()->postJson('/api/yo/cimacoins/secreto', ['answer' => $answer]);
        $secret(['drop', 'cloud', 'star'])->assertUnprocessable();
        foreach (['senal-lluvia', 'ruta-mochila', 'mapa-cuenca'] as $id) {
            $this->asStudent()->postJson('/api/yo/cimacoins/reto', ['id' => $id])->assertOk();
        }
        $secret(['cloud', 'drop', 'star'])->assertUnprocessable();
        $secret(['drop', 'cloud', 'star'])->assertOk()->assertJsonPath('wallet.angelic', true);
        $this->assertContains('cabeza/halo', $this->student->fresh()->wallet['owned']);
    }

    public function test_premio_por_terminar_solo_con_la_actividad_completa(): void
    {
        $claim = fn () => $this->asStudent()->postJson('/api/yo/cimacoins/premio', ['id' => 'termino-mochila']);
        $claim()->assertUnprocessable();
        $this->asStudent()->postJson('/api/actividades/mochila/inicio')->assertOk();
        $this->travel(46)->seconds();
        $this->asStudent()->postJson('/api/actividades/mochila/terminar')->assertOk();
        // 80 iniciales + 20 puntos × 5 + 40 por terminar
        $claim()->assertOk()->assertJsonPath('new', true)->assertJsonPath('wallet.coins', 220);
        $claim()->assertOk()->assertJsonPath('new', false)->assertJsonPath('wallet.coins', 220);
        // Abrir el juego no necesita nada
        $this->asStudent()->postJson('/api/yo/cimacoins/premio', ['id' => 'juego-alerta-911'])->assertOk()->assertJsonPath('wallet.coins', 230);
    }

    public function test_visitante_revisa_respuesta_sin_guardar_nada(): void
    {
        $this->postJson('/api/actividades/codigo-120/revisar', ['answer' => 0])->assertUnprocessable()->assertJsonPath('correct', false);
        $this->postJson('/api/actividades/codigo-120/revisar', ['answer' => 1])->assertOk()->assertJsonPath('correct', true);
        $this->postJson('/api/actividades/codigo-120/revisar', ['answer' => 'x'])->assertUnprocessable();
        // Solo juegos de otros sitios: lecturas y juegos propios no se revisan así
        $this->postJson('/api/actividades/lectura-conozca/revisar', ['answer' => 0])->assertNotFound();
        $this->postJson('/api/actividades/mochila/revisar', ['answer' => 0])->assertNotFound();
        $this->postJson('/api/actividades/no-existe/revisar', ['answer' => 0])->assertNotFound();
        $this->assertSame(0, DB::table('completions')->count());
        $this->assertSame(0, DB::table('activity_starts')->count());
    }

    public function test_cimacoins_solo_con_sesion(): void
    {
        $this->postJson('/api/yo/cimacoins/premio', ['id' => 'moneda-conozca'])->assertUnauthorized();
        $this->putJson('/api/yo/cimarron', ['avatar' => []])->assertUnauthorized();
    }
}
