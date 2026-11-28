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

class SchoolDashboardTest extends TestCase
{
    use RefreshDatabase;

    // Escuela con un docente, un grupo, dos alumnos y una actividad completada
    private function escuela(string $teacherName, array $students): array
    {
        $user = $this->school();
        $teacher = new Teacher(['name' => $teacherName]);
        $teacher->school_id = $user->school->id;
        $teacher->save();
        $classroom = new Classroom(['name' => '3° A', 'grade' => '3°']);
        $classroom->teacher_id = $teacher->id;
        $classroom->code = Classroom::newCode();
        $classroom->save();
        $ids = [];
        foreach ($students as $name) {
            $student = new Student(['name' => $name]);
            $student->classroom_id = $classroom->id;
            $student->name_key = mb_strtolower($name);
            $student->save();
            $ids[] = $student->id;
        }
        $activity = DB::table('activities')->where('key', 'mochila')->value('id');
        DB::table('completions')->insert(['student_id' => $ids[0], 'activity_id' => $activity, 'points' => 20, 'completed_at' => now()]);

        return [$user, $teacher, $classroom];
    }

    public function test_la_escuela_ve_su_panel_con_docentes_grupos_y_actividades(): void
    {
        Catalog::sync();
        [$user, , $classroom] = $this->escuela('Laura Docente', ['Ana Robles', 'Beto Quiñones']);
        $this->actingAs($user)->getJson('/api/escuela/panel')->assertOk()
            ->assertJsonPath('totals.teachers', 1)->assertJsonPath('totals.classrooms', 1)
            ->assertJsonPath('totals.students', 2)->assertJsonPath('totals.completions', 1)
            ->assertJsonPath('teachers.0.name', 'Laura Docente')->assertJsonPath('teachers.0.completions', 1)
            ->assertJsonPath('classrooms.0.students', 2)->assertJsonPath('classrooms.0.completions', 1)
            ->assertJsonPath('classrooms.0.last_activity', now()->toDateString())
            ->assertJsonPath('activities.0.title', 'Arma tu mochila')
            ->assertJsonCount(8, 'weeks');
        // Con fechas sin actividad
        $later = now()->addDays(5)->toDateString();
        $this->actingAs($user)->getJson("/api/escuela/panel?desde={$later}&hasta={$later}")->assertOk()
            ->assertJsonPath('totals.completions', 0)->assertJsonPath('classrooms.0.completions', 0);
        // Avance por alumno con nombre, igual que el docente
        $this->actingAs($user)->getJson("/api/escuela/grupos/{$classroom->id}/avance")->assertOk()
            ->assertJsonPath('students.0.name', 'Ana Robles');
        $csv = $this->actingAs($user)->get("/api/escuela/grupos/{$classroom->id}/avance.csv")->assertOk()->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $this->assertStringContainsString('Ana Robles', $csv);
        foreach (['docentes', 'grupos', 'actividades'] as $tipo) {
            $out = $this->actingAs($user)->get("/api/escuela/exportar/{$tipo}")->assertOk()->streamedContent();
            $this->assertStringStartsWith("\xEF\xBB\xBF", $out);
            $this->assertStringNotContainsString('Ana Robles', $out);
            $this->assertStringNotContainsString($classroom->code, $out);
        }
        $this->assertSame(4, DB::table('audit_logs')->whereIn('action', ['exportar-datos-escuela', 'exportar-avance-grupo'])->count());
    }

    public function test_una_escuela_no_ve_nada_de_otra(): void
    {
        Catalog::sync();
        [$a] = $this->escuela('Laura Docente', ['Ana Robles']);
        [$b, , $classroomB] = $this->escuela('Pedro Otro', ['Carla Secreta']);
        $panel = $this->actingAs($a)->getJson('/api/escuela/panel')->assertOk();
        $this->assertStringNotContainsString('Pedro Otro', $panel->getContent());
        $this->assertSame(1, $panel->json('totals.students'));
        $this->actingAs($a)->getJson("/api/escuela/grupos/{$classroomB->id}/avance")->assertNotFound();
        $this->actingAs($a)->get("/api/escuela/grupos/{$classroomB->id}/avance.csv")->assertNotFound();
        foreach (['docentes', 'grupos', 'actividades'] as $tipo) {
            $out = $this->actingAs($a)->get("/api/escuela/exportar/{$tipo}")->assertOk()->streamedContent();
            $this->assertStringNotContainsString('Pedro Otro', $out);
            $this->assertStringNotContainsString('Carla Secreta', $out);
        }
        $this->actingAs($a)->getJson('/api/escuela/exportar/alumnos')->assertNotFound();
    }

    public function test_sin_cuenta_de_escuela_activa_no_hay_panel(): void
    {
        Catalog::sync();
        [$user, , $classroom] = $this->escuela('Laura Docente', ['Ana Robles']);
        // Sin sesión (un docente entra con su enlace, sin sesión de escuela)
        $this->getJson('/api/escuela/panel')->assertUnauthorized();
        $this->getJson("/api/escuela/grupos/{$classroom->id}/avance")->assertUnauthorized();
        // Admin y solo lectura no son escuelas
        $this->actingAs($this->admin())->getJson('/api/escuela/panel')->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'viewer']))->getJson('/api/escuela/panel')->assertForbidden();
        // Escuela suspendida
        $user->school->forceFill(['status' => 'suspended'])->save();
        $this->actingAs($user->fresh())->getJson('/api/escuela/panel')->assertForbidden();
        $this->actingAs($user->fresh())->get('/api/escuela/exportar/grupos')->assertForbidden();
    }

    public function test_el_panel_de_admin_filtra_por_fechas_y_da_la_ultima_actividad(): void
    {
        Catalog::sync();
        $this->escuela('Laura Docente', ['Ana Robles']);
        $admin = $this->admin();
        $this->actingAs($admin)->getJson('/api/admin/estadisticas')->assertOk()
            ->assertJsonPath('totals.completions', 1)->assertJsonPath('schools.0.last_activity', now()->toDateString());
        $later = now()->addDays(5)->toDateString();
        $this->actingAs($admin)->getJson("/api/admin/estadisticas?desde={$later}&hasta={$later}")->assertOk()
            ->assertJsonPath('totals.completions', 0)->assertJsonPath('schools.0.completions', 0)
            ->assertJsonPath('schools.0.last_activity', now()->toDateString())
            ->assertJsonPath('desde', $later);
        $this->actingAs($admin)->getJson('/api/admin/estadisticas?desde=2026-12-10&hasta=2026-12-01')->assertUnprocessable();
    }
}
