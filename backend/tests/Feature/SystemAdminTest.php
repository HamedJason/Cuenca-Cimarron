<?php

namespace Tests\Feature;

use App\Mail\Notice;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SystemAdminTest extends TestCase
{
    use RefreshDatabase;

    private function setUpSchool(): array
    {
        $school = $this->school();
        $teacher = new Teacher(['name' => 'Laura']);
        $teacher->school_id = $school->school->id;
        $teacher->save();
        $classroom = new Classroom(['name' => '2° A', 'grade' => '2°']);
        $classroom->teacher_id = $teacher->id;
        $classroom->school_year = '2025-2026';
        $classroom->code = Classroom::newCode();
        $classroom->save();
        $student = new Student(['name' => 'Ana']);
        $student->classroom_id = $classroom->id;
        $student->name_key = 'ana';
        $student->assignReturnCode();
        $student->save();
        $token = bin2hex(random_bytes(32));
        DB::table('device_sessions')->insert([
            'kind' => 'student', 'owner_id' => $student->id, 'token_hash' => hash('sha256', $token),
            'last_used_on' => now()->toDateString(), 'expires_at' => now()->addDays(400), 'created_at' => now(),
        ]);

        return [$school, $teacher, $classroom, $token];
    }

    public function test_solo_la_administracion_ve_el_sistema(): void
    {
        $viewer = User::factory()->create(['role' => 'viewer']);
        foreach (['/api/admin/sistema', '/api/admin/bitacora'] as $url) {
            $this->actingAs($viewer)->getJson($url)->assertForbidden();
        }
        $this->actingAs($viewer)->postJson('/api/admin/sistema/limpieza')->assertForbidden();
        $this->actingAs($this->admin())->getJson('/api/admin/sistema')->assertOk()
            ->assertJsonPath('checks.0.key', 'database')->assertJsonPath('checks.0.ok', true)
            ->assertJsonPath('checks.1.ok', false)
            ->assertJsonStructure(['commit', 'counts' => ['escuelas', 'alumnos'], 'school_years', 'current_school_year']);
    }

    public function test_detalle_de_escuela_y_ayuda_con_enlaces(): void
    {
        Mail::fake();
        [$school, $teacher] = $this->setUpSchool();
        $admin = $this->admin();
        $this->actingAs($admin)->getJson("/api/admin/escuelas/{$school->school->id}")->assertOk()
            ->assertJsonPath('teachers.0.name', 'Laura')->assertJsonPath('teachers.0.students', 1)
            ->assertJsonPath('classrooms.0.students', 1)
            ->assertJsonMissing(['name' => 'Ana']);
        $link = $this->actingAs($admin)->postJson("/api/admin/docentes/{$teacher->id}/enlace")->assertOk()->json('link');
        $this->assertStringContainsString('/docente/acceso/', $link);
        $reset = $this->actingAs($admin)->postJson("/api/admin/escuelas/{$school->school->id}/contrasena")->assertOk()->json('link');
        $this->assertStringContainsString('/escuelas/contrasena?token=', $reset);
        Mail::assertSent(Notice::class);
        $this->actingAs($admin)->putJson("/api/admin/escuelas/{$school->school->id}/correo", ['email' => $admin->email])->assertUnprocessable();
        $this->actingAs($admin)->putJson("/api/admin/escuelas/{$school->school->id}/correo", ['email' => 'Nuevo@Escuela.mx'])->assertOk()->assertJsonPath('email', 'nuevo@escuela.mx');
    }

    public function test_suspender_corta_el_acceso_de_docentes_y_alumnos(): void
    {
        [$school, , , $token] = $this->setUpSchool();
        $admin = $this->admin();
        $student = fn () => $this->withCredentials()->withUnencryptedCookie('cc_alumno', $token);
        $student()->getJson('/api/yo')->assertJsonPath('student.name', 'Ana');
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$school->school->id}/suspender", ['reason' => 'Datos falsos'])->assertOk()->assertJsonPath('school.status', 'suspended');
        $student()->getJson('/api/yo')->assertJsonPath('student', null);
        $student()->postJson('/api/actividades/lectura-conozca/respuesta', ['answer' => 0])->assertForbidden();
        $this->actingAs($admin)->getJson('/api/admin/escuelas?estado=suspended')->assertOk()->assertJsonCount(1, 'schools');
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$school->school->id}/reactivar")->assertOk()->assertJsonPath('school.status', 'approved');
        $student()->getJson('/api/yo')->assertJsonPath('student.name', 'Ana');
    }

    public function test_cerrar_ciclo_y_limpieza(): void
    {
        [, , $classroom] = $this->setUpSchool();
        $admin = $this->admin();
        $this->actingAs($admin)->postJson('/api/admin/sistema/cerrar-ciclo', ['school_year' => '2025-2026', 'confirm' => 'si'])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/admin/sistema/cerrar-ciclo', ['school_year' => '2025-2026', 'confirm' => 'CERRAR'])->assertOk()->assertJsonPath('archived', 1);
        $this->assertNotNull($classroom->fresh()->archived_at);
        $this->assertNull($classroom->fresh()->code);
        $this->actingAs($admin)->postJson('/api/admin/sistema/limpieza')->assertOk()->assertJsonStructure(['device_sessions_removed', 'students_anonymized']);
    }

    public function test_bitacora_con_nombres_y_filtro(): void
    {
        [$school] = $this->setUpSchool();
        $admin = $this->admin();
        $this->actingAs($admin)->postJson("/api/admin/escuelas/{$school->school->id}/suspender", ['reason' => 'Revisión'])->assertOk();
        $this->actingAs($admin)->postJson('/api/admin/sistema/limpieza')->assertOk();
        $log = $this->actingAs($admin)->getJson('/api/admin/bitacora')->assertOk();
        $this->assertSame('limpieza', $log->json('entries.0.action'));
        $this->assertSame($admin->email, $log->json('entries.0.actor'));
        $this->actingAs($admin)->getJson('/api/admin/bitacora?accion=suspender-escuela')->assertOk()
            ->assertJsonCount(1, 'entries')->assertJsonPath('entries.0.subject', 'Primaria Benito Juárez')
            ->assertJsonPath('entries.0.details.motivo', 'Revisión');
    }
}
