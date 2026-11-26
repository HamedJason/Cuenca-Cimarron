<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Groserias;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class OpinionsTest extends TestCase
{
    use RefreshDatabase;

    private function send(array $data = [], ?string $ip = null)
    {
        $request = $ip ? $this->withServerVariables(['REMOTE_ADDR' => $ip]) : $this;

        return $request->postJson('/api/opiniones', $data + ['rating' => 5, 'device' => (string) Str::uuid()]);
    }

    public function test_guarda_la_opinion_sin_datos_de_quien_la_manda(): void
    {
        $device = (string) Str::uuid();
        $this->send(['rating' => 4, 'comment' => '  Me gustó   mucho el juego ', 'device' => $device], '10.1.2.3')
            ->assertCreated()->assertJsonPath('summary.count', 1)->assertJsonPath('summary.average', 4);
        $row = (array) DB::table('opinions')->first();
        $this->assertSame('Me gustó mucho el juego', $row['comment']);
        $this->assertEqualsCanonicalizing(['id', 'rating', 'comment', 'origin', 'hidden_reason', 'created_at'], array_keys($row));
        $this->assertStringNotContainsString('10.1.2.3', json_encode($row));
        $this->assertStringNotContainsString($device, json_encode($row));
        $this->assertSame(0, now()->parse($row['created_at'])->minute % 10);
    }

    public function test_un_dispositivo_espera_10_minutos(): void
    {
        $device = (string) Str::uuid();
        $this->send(['device' => $device])->assertCreated();
        $this->send(['device' => $device])->assertStatus(429)->assertJsonFragment(['message' => 'Ya mandaste una opinión hace poco. Puedes mandar otra en 10 minutos']);
        $this->send()->assertCreated();
        $this->travel(11)->minutes();
        $this->send(['device' => $device])->assertCreated();
        $this->assertDatabaseCount('opinions', 3);
    }

    public function test_limite_alto_por_red(): void
    {
        for ($i = 0; $i < 40; $i++) {
            $this->send([], '10.9.9.9')->assertCreated();
        }
        $this->send([], '10.9.9.9')->assertStatus(429);
        $this->send([], '10.9.9.10')->assertCreated();
    }

    public function test_valida_estrellas_largo_y_dispositivo(): void
    {
        $this->send(['rating' => 0])->assertUnprocessable()->assertJsonValidationErrors('rating');
        $this->send(['rating' => 6])->assertUnprocessable();
        $this->send(['comment' => str_repeat('a', 501)])->assertUnprocessable()->assertJsonValidationErrors('comment');
        $this->postJson('/api/opiniones', ['rating' => 5, 'device' => 'abc'])->assertUnprocessable()->assertJsonValidationErrors('device');
        $this->assertDatabaseCount('opinions', 0);
    }

    public function test_campo_trampa_no_guarda_nada(): void
    {
        $this->send(['sitio' => 'http://spam.example'])->assertCreated();
        $this->assertDatabaseCount('opinions', 0);
    }

    public function test_groserias_ocultan_el_comentario_pero_cuentan_las_estrellas(): void
    {
        $this->send(['rating' => 1, 'comment' => 'Está bien PÉNDEJO'])->assertCreated();
        $this->send(['rating' => 5, 'comment' => 'Muy bonito'])->assertCreated();
        $this->getJson('/api/opiniones')->assertOk()
            ->assertJsonPath('summary.count', 2)
            ->assertJsonPath('summary.average', 3)
            ->assertJsonPath('summary.stars.1', 1)
            ->assertJsonCount(1, 'opinions')
            ->assertJsonPath('opinions.0.comment', 'Muy bonito')
            ->assertJsonMissing(['comment' => 'Está bien PÉNDEJO']);
        $this->assertSame('filtro', DB::table('opinions')->where('rating', 1)->value('hidden_reason'));
    }

    public function test_filtro_no_marca_palabras_normales(): void
    {
        foreach (['puuuto', 'p3nd3jo', 'Chingada madre', 'visita www.algo.com'] as $text) {
            $this->assertTrue(Groserias::contiene($text), $text);
        }
        foreach (['Usé la computadora', 'Me dio vergüenza', 'El cono naranja', 'La perra de mi tía', 'Llegó retrasado el camión', 'Toqué el pito'] as $text) {
            $this->assertFalse(Groserias::contiene($text), $text);
        }
    }

    public function test_pagina_de_10_en_10(): void
    {
        for ($i = 1; $i <= 12; $i++) {
            $this->send(['comment' => "Comentario {$i}"])->assertCreated();
        }
        $this->send()->assertCreated();
        $first = $this->getJson('/api/opiniones')->assertOk()->assertJsonCount(10, 'opinions')->assertJsonPath('more', true)
            ->assertJsonPath('summary.count', 13)->json();
        $this->assertSame('Comentario 12', $first['opinions'][0]['comment']);
        $last = end($first['opinions'])['id'];
        $this->getJson("/api/opiniones?antes_de={$last}")->assertOk()->assertJsonCount(2, 'opinions')->assertJsonPath('more', false);
    }

    public function test_solo_la_administracion_modera(): void
    {
        $this->send(['comment' => 'No me gustó el color'])->assertCreated();
        $id = DB::table('opinions')->value('id');
        $this->postJson("/api/admin/opiniones/{$id}/ocultar")->assertUnauthorized();
        $viewer = User::factory()->create(['role' => 'viewer']);
        $this->actingAs($viewer)->postJson("/api/admin/opiniones/{$id}/ocultar")->assertForbidden();
        $this->actingAs($viewer)->getJson('/api/admin/opiniones')->assertForbidden();

        $admin = $this->admin();
        $this->actingAs($admin)->postJson("/api/admin/opiniones/{$id}/ocultar")->assertOk();
        $this->getJson('/api/opiniones')->assertJsonCount(0, 'opinions')->assertJsonPath('summary.count', 1);
        $this->actingAs($admin)->getJson('/api/admin/opiniones?filtro=ocultas')->assertOk()
            ->assertJsonPath('hidden', 1)->assertJsonPath('opinions.0.hidden_reason', 'admin');
        $this->actingAs($admin)->postJson("/api/admin/opiniones/{$id}/mostrar")->assertOk();
        $this->getJson('/api/opiniones')->assertJsonCount(1, 'opinions');
        $this->assertDatabaseHas('audit_logs', ['action' => 'ocultar-opinion', 'subject_id' => $id]);
        $this->actingAs($admin)->postJson('/api/admin/opiniones/999/ocultar')->assertNotFound();
    }
}
