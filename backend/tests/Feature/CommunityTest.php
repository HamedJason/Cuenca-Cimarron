<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CommunityTest extends TestCase
{
    use RefreshDatabase;

    public function test_recargas_no_duplican_visitantes_ni_sesiones(): void
    {
        $data = ['visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid()];
        $this->postJson('/api/visits', $data)->assertOk()->assertExactJson(['unique_visitors' => 1, 'total_visits' => 1]);
        $this->postJson('/api/visits', $data)->assertOk()->assertExactJson(['unique_visitors' => 1, 'total_visits' => 1]);
        $data['session_id'] = (string) Str::uuid();
        $this->postJson('/api/visits', $data)->assertOk()->assertExactJson(['unique_visitors' => 1, 'total_visits' => 2]);
        $this->assertNotSame($data['visitor_id'], DB::table('visitors')->value('id'));
    }

    public function test_otro_navegador_incrementa_el_conteo(): void
    {
        foreach ([1, 2] as $number) {
            $this->postJson('/api/visits', ['visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid()])
                ->assertOk()->assertJson(['unique_visitors' => $number, 'total_visits' => $number]);
        }
        $this->getJson('/api/stats')->assertOk()->assertExactJson(['unique_visitors' => 2, 'total_visits' => 2]);
    }

    public function test_rechaza_identificadores_invalidos_sin_guardarlos(): void
    {
        $this->postJson('/api/visits', ['visitor_id' => 'invalid', 'session_id' => 'invalid'])
            ->assertUnprocessable()->assertJsonValidationErrors(['visitor_id', 'session_id']);
        $this->assertDatabaseCount('visitors', 0);
    }

    public function test_juegos_tienen_lista_permitida_y_sesiones_idempotentes(): void
    {
        $data = ['visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'game' => 'inventado'];
        $this->postJson('/api/game-sessions', $data)->assertUnprocessable();
        $data['game'] = 'mochila';
        $this->postJson('/api/game-sessions', $data)->assertCreated()->assertJson(['plays' => 1]);
        $this->postJson('/api/game-sessions', $data)->assertOk()->assertJson(['plays' => 1]);
        $this->assertDatabaseCount('game_sessions', 1);
        $this->assertDatabaseCount('visits', 0);
    }

    public function test_cuenta_entradas_por_juego(): void
    {
        foreach (['mochila', 'mochila', 'mision-tijuana'] as $game) {
            $this->postJson('/api/game-sessions', [
                'visitor_id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'game' => $game,
            ])->assertCreated();
        }
        $this->getJson('/api/game-sessions')->assertOk()
            ->assertJsonPath('plays.mochila', 2)
            ->assertJsonPath('plays.mision-tijuana', 1)
            ->assertJsonPath('plays.cinco-segundos', 0);
    }
}
