<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Support\Catalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    private User $schoolUser;

    private Classroom $classroom;

    private function datos(): void
    {
        Catalog::sync();
        $this->schoolUser = $this->school();
        $this->schoolUser->school->forceFill(['cct' => null, 'lat' => 32.52, 'lng' => -117.03])->save();
        $mxl = $this->school();
        $mxl->school->forceFill(['cct' => null, 'name' => 'Primaria Cuauhtémoc', 'lat' => 32.62, 'lng' => -115.45])->save();
        $teacher = new Teacher(['name' => 'Laura Docente']);
        $teacher->school_id = $this->schoolUser->school->id;
        $teacher->save();
        $this->classroom = new Classroom(['name' => '3° A', 'grade' => '3°']);
        $this->classroom->teacher_id = $teacher->id;
        $this->classroom->code = Classroom::newCode();
        $this->classroom->save();
        foreach (['Ana Robles', 'Beto Quiñones'] as $name) {
            $student = new Student(['name' => $name]);
            $student->classroom_id = $this->classroom->id;
            $student->name_key = mb_strtolower($name);
            $student->save();
        }
        $activity = DB::table('activities')->where('key', 'mochila')->value('id');
        DB::table('completions')->insert(['student_id' => Student::first()->id, 'activity_id' => $activity, 'points' => 20, 'completed_at' => now()]);
        DB::table('visit_zones')->insert([
            ['day' => now()->toDateString(), 'municipio' => 'Tijuana', 'zona' => 'Playas', 'visits' => 3],
            ['day' => now()->toDateString(), 'municipio' => 'Mexicali', 'zona' => 'Mexicali', 'visits' => 2],
        ]);
        DB::table('opinions')->insert(['rating' => 5, 'comment' => 'Muy útil para mi familia', 'origin' => 'comunidad', 'created_at' => now()]);
    }

    private function csv(string $url): string
    {
        $response = $this->get($url)->assertOk();
        $this->assertStringStartsWith('text/csv', $response->headers->get('content-type'));

        return $response->streamedContent();
    }

    public function test_solo_la_administracion_puede_exportar(): void
    {
        $this->datos();
        $this->getJson('/api/admin/exportar/escuelas')->assertUnauthorized();
        $this->actingAs($this->schoolUser)->getJson('/api/admin/exportar/escuelas')->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'viewer']))->getJson('/api/admin/exportar/escuelas')->assertForbidden();
        $admin = $this->admin();
        $this->actingAs($admin)->getJson('/api/admin/exportar/alumnos')->assertNotFound();
        $this->actingAs($admin)->getJson('/api/admin/exportar/escuelas?municipio=Los Angeles')->assertUnprocessable();
        $this->actingAs($admin)->getJson('/api/admin/exportar/escuelas?desde=2026-12-10&hasta=2026-12-01')->assertUnprocessable();
    }

    public function test_cada_archivo_sale_en_csv_para_excel_y_queda_en_la_bitacora(): void
    {
        $this->datos();
        $admin = $this->admin();
        $this->actingAs($admin);
        $escuelas = $this->csv('/api/admin/exportar/escuelas');
        $this->assertStringStartsWith("\xEF\xBB\xBF", $escuelas);
        $this->assertStringContainsString('Escuela,CCT,Municipio,Nivel,Colonia,Estado,"Fecha de registro",Docentes,Grupos,Alumnos,"Actividades completadas","Cimacoins ganadas"', $escuelas);
        $this->assertMatchesRegularExpression('/"Primaria Benito Juárez",,Tijuana,primaria,"Sánchez Taboada",Registrada,\d{4}-\d{2}-\d{2},1,1,2,1,\d+/', $escuelas);
        $this->assertStringContainsString('"Primaria Cuauhtémoc",,Mexicali', $escuelas);
        $this->assertStringContainsString('Tijuana,1,0,1,1,2,1', $this->csv('/api/admin/exportar/municipios'));
        $this->assertStringContainsString('Tijuana,"Arma tu mochila"', $this->csv('/api/admin/exportar/actividades'));
        $this->assertStringContainsString('Tijuana,Playas,3', $this->csv('/api/admin/exportar/visitas'));
        $this->assertStringContainsString('"Muy útil para mi familia"', $this->csv('/api/admin/exportar/opiniones'));
        $semanas = $this->csv('/api/admin/exportar/semanas');
        $this->assertStringContainsString('"Semana que empieza"', $semanas);
        $this->assertSame(6, DB::table('audit_logs')->where('action', 'exportar-datos')->where('actor_id', $admin->id)->count());
    }

    public function test_filtra_por_municipio_y_por_fechas(): void
    {
        $this->datos();
        $this->actingAs($this->admin());
        $mxl = $this->csv('/api/admin/exportar/escuelas?municipio=Mexicali');
        $this->assertStringContainsString('Primaria Cuauhtémoc', $mxl);
        $this->assertStringNotContainsString('Benito Juárez', $mxl);
        $this->assertStringNotContainsString('Tijuana', $this->csv('/api/admin/exportar/visitas?municipio=Mexicali'));
        // Con fechas sin actividad, la escuela sale con 0 actividades
        $after = now()->addDays(3)->toDateString();
        $this->assertStringContainsString(',1,1,2,0,0', $this->csv("/api/admin/exportar/escuelas?desde={$after}&hasta={$after}"));
        $this->assertStringNotContainsString('mochila', $this->csv("/api/admin/exportar/actividades?desde={$after}"));
    }

    public function test_no_salen_datos_personales(): void
    {
        $this->datos();
        $this->actingAs($this->admin());
        $all = '';
        foreach (['escuelas', 'municipios', 'actividades', 'semanas', 'visitas', 'opiniones'] as $tipo) {
            $all .= $this->csv("/api/admin/exportar/{$tipo}");
        }
        foreach (['Ana Robles', 'Beto Quiñones', 'Laura Docente', $this->classroom->code, $this->schoolUser->email, 'Laura Pérez'] as $private) {
            $this->assertStringNotContainsString($private, $all);
        }
    }
}
