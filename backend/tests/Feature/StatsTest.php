<?php

namespace Tests\Feature;

use App\Http\Controllers\StatsController;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\Catalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_municipio_por_ubicacion_usa_los_siete(): void
    {
        $this->assertSame('Tijuana', StatsController::municipalityNear(32.52, -117.03));
        $this->assertSame('Playas de Rosarito', StatsController::municipalityNear(32.35, -117.05));
        $this->assertSame('San Quintín', StatsController::municipalityNear(30.55, -115.94));
        $this->assertSame('San Felipe', StatsController::municipalityNear(31.03, -114.84));
        $this->assertSame('Sin dato', StatsController::municipalityNear(null, null));
    }

    public function test_estadisticas_solo_con_cifras_y_solo_para_admin(): void
    {
        Catalog::sync();
        $school = $this->school();
        $school->school->forceFill(['lat' => 32.5, 'lng' => -117.0])->save();
        $this->school('suspended');
        $teacher = new Teacher(['name' => 'Laura']);
        $teacher->school_id = $school->school->id;
        $teacher->save();
        $classroom = new Classroom(['name' => '3° A', 'grade' => '3°']);
        $classroom->teacher_id = $teacher->id;
        $classroom->code = Classroom::newCode();
        $classroom->save();
        foreach (['Ana', 'Beto'] as $name) {
            $student = new Student(['name' => $name]);
            $student->classroom_id = $classroom->id;
            $student->name_key = strtolower($name);
            $student->save();
        }
        $activity = DB::table('activities')->where('key', 'mochila')->value('id');
        DB::table('completions')->insert(['student_id' => Student::first()->id, 'activity_id' => $activity, 'points' => 20, 'completed_at' => now()]);

        $this->getJson('/api/admin/estadisticas')->assertUnauthorized();
        $this->actingAs($school)->getJson('/api/admin/estadisticas')->assertForbidden();
        $response = $this->actingAs($this->admin())->getJson('/api/admin/estadisticas')->assertOk()
            ->assertJsonPath('totals.schools', 1)
            ->assertJsonPath('totals.suspended_schools', 1)
            ->assertJsonPath('totals.students', 2)
            ->assertJsonPath('totals.points', 20)
            ->assertJsonPath('schools.0.students', 2)
            ->assertJsonPath('schools.0.completions', 1)
            ->assertJsonPath('colonias.0.name', 'Sánchez Taboada')
            ->assertJsonPath('colonias.0.students', 2)
            ->assertJsonPath('municipalities.0.name', 'Tijuana')
            ->assertJsonPath('levels.0.name', 'primaria')
            ->assertJsonPath('schools.0.teachers', 1)
            ->assertJsonPath('activities.0.key', 'mochila')
            ->assertJsonCount(8, 'weeks');
        $this->assertSame(1, collect($response->json('weeks'))->sum('completions'));
        $this->assertSame(2, collect($response->json('weeks'))->sum('students'));
        $this->assertSame(2, collect($response->json('weeks'))->sum('schools'));
        $this->assertStringNotContainsString('Beto', $response->getContent());
        $this->assertStringNotContainsString('Ana', $response->getContent());
    }
}
