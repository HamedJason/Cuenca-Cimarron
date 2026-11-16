<?php

namespace Tests\Feature;

use App\Support\Settings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_version_dice_el_commit_y_si_la_base_responde(): void
    {
        config(['app.commit' => 'abc123']);
        $this->getJson('/api/version')->assertOk()->assertExactJson(['commit' => 'abc123', 'database' => true]);
    }

    public function test_certificado_solo_para_el_dominio_configurado(): void
    {
        $this->get('/api/tls/permitir?domain=cuenca.example.org')->assertNotFound();
        Settings::set('domain', 'cuenca.example.org');
        $this->get('/api/tls/permitir?domain=cuenca.example.org')->assertOk();
        $this->get('/api/tls/permitir?domain=CUENCA.example.org')->assertOk();
        $this->get('/api/tls/permitir?domain=otro.example.org')->assertNotFound();
        $this->get('/api/tls/permitir')->assertNotFound();
    }

    public function test_dominio_de_env_cuando_no_hay_ajuste(): void
    {
        config(['app.dominio' => 'desde-env.example.org']);
        $this->get('/api/tls/permitir?domain=desde-env.example.org')->assertOk();
        $this->assertSame('https://desde-env.example.org', Settings::publicUrl());
    }

    public function test_ajustes_sensibles_se_guardan_cifrados(): void
    {
        Settings::set('mail_password', 'secreta');
        $this->assertNotSame('secreta', DB::table('settings')->where('key', 'mail_password')->value('value'));
        Settings::forget();
        $this->assertSame('secreta', Settings::get('mail_password'));
    }

    public function test_un_salon_entero_con_la_misma_ip_no_se_bloquea(): void
    {
        for ($i = 0; $i < 150; $i++) {
            $this->getJson('/api/stats')->assertOk();
        }
        // Las rutas de cuentas cuentan aparte de las públicas.
        $this->getJson('/api/sesion')->assertOk();
    }
}
