<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\DeviceAuth;
use App\Support\Privacy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ClassroomsTest extends TestCase
{
    use RefreshDatabase;

    private function inviteToken(string $link): string
    {
        return substr($link, strrpos($link, '/') + 1);
    }

    private function teacherCookie(?Teacher &$teacher = null, string $status = 'approved'): string
    {
        $school = $this->school($status);
        $teacher = new Teacher(['name' => 'Laura Pérez']);
        $teacher->school_id = $school->school->id;
        $teacher->save();

        return $this->cookieFor('teacher', $teacher->id);
    }

    private function cookieFor(string $kind, int $id): string
    {
        $token = bin2hex(random_bytes(32));
        DB::table('device_sessions')->insert([
            'kind' => $kind, 'owner_id' => $id, 'token_hash' => hash('sha256', $token),
            'last_used_on' => now()->toDateString(), 'expires_at' => now()->addDays(400), 'created_at' => now(),
        ]);

        return $token;
    }

    private function asTeacher(string $token): static
    {
        return $this->noCookies()->withCredentials()->withUnencryptedCookie('cc_docente', $token);
    }

    private function noCookies(): static
    {
        $this->unencryptedCookies = [];
        $this->defaultCookies = [];

        return $this;
    }

    private function asStudent(string $token): static
    {
        return $this->noCookies()->withCredentials()->withUnencryptedCookie('cc_alumno', $token);
    }

    private function classroom(string $teacherToken, string $name = '4° B'): array
    {
        return $this->asTeacher($teacherToken)->postJson('/api/docente/grupos', ['name' => $name, 'grade' => '4°'])->assertCreated()->json('classroom');
    }

    public function test_escuela_da_de_alta_docente_y_el_enlace_sirve_una_vez(): void
    {
        $school = $this->school();
        $response = $this->actingAs($school)->postJson('/api/escuela/docentes', ['name' => 'Laura Pérez'])->assertCreated();
        $token = $this->inviteToken($response->json('link'));
        $first = $this->postJson('/api/docente/acceso', ['token' => $token])->assertOk()->assertJsonPath('teacher.name', 'Laura Pérez');
        $cookie = $first->getCookie('cc_docente', false);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->assertGreaterThan(now()->addDays(399)->timestamp, $cookie->getExpiresTime());
        $this->postJson('/api/docente/acceso', ['token' => $token])->assertUnprocessable();
        $this->asTeacher($cookie->getValue())->getJson('/api/docente')->assertOk()->assertJsonPath('teacher.school', 'Primaria Benito Juárez');
    }

    public function test_escuela_pendiente_no_puede_dar_de_alta_docentes(): void
    {
        $this->actingAs($this->school('pending'))->postJson('/api/escuela/docentes', ['name' => 'Laura'])->assertForbidden();
    }

    public function test_dar_de_baja_docente_cierra_sus_sesiones(): void
    {
        $token = $this->teacherCookie($teacher);
        $this->asTeacher($token)->getJson('/api/docente')->assertOk();
        $this->actingAs($teacher->school->user)->postJson("/api/escuela/docentes/{$teacher->id}/baja")->assertOk();
        $this->asTeacher($token)->getJson('/api/docente')->assertUnauthorized();
    }

    public function test_una_escuela_no_toca_docentes_de_otra(): void
    {
        $this->teacherCookie($teacher);
        $other = $this->school();
        $this->actingAs($other)->postJson("/api/escuela/docentes/{$teacher->id}/baja")->assertNotFound();
    }

    public function test_docente_crea_grupo_con_codigo_unico(): void
    {
        $token = $this->teacherCookie();
        $first = $this->classroom($token);
        $second = $this->classroom($token, '4° C');
        $this->assertMatchesRegularExpression('/^\d{6}$/', $first['code']);
        $this->assertNotSame($first['code'], $second['code']);
        $this->assertStringEndsWith('/unirse/'.$first['code'], $first['link']);
        $this->asTeacher($token)->getJson('/api/docente/grupos')->assertOk()->assertJsonCount(2, 'classrooms');
    }

    public function test_docente_no_ve_grupos_de_otro(): void
    {
        $mine = $this->teacherCookie();
        $other = $this->teacherCookie();
        $classroom = $this->classroom($mine);
        $this->asTeacher($other)->getJson("/api/docente/grupos/{$classroom['id']}/alumnos")->assertNotFound();
        $this->asTeacher($other)->postJson("/api/docente/grupos/{$classroom['id']}/codigo")->assertNotFound();
    }

    public function test_alumno_entra_con_codigo_y_nombre(): void
    {
        $classroom = $this->classroom($this->teacherCookie());
        $this->getJson("/api/unirse/{$classroom['code']}")->assertOk()
            ->assertJsonPath('classroom.name', '4° B')->assertJsonPath('classroom.teacher', 'Laura Pérez');
        $this->getJson('/api/unirse/000000')->assertNotFound();
        $response = $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => '  Ana   María ']);
        $response->assertCreated()->assertJsonPath('student.name', 'Ana María');
        $token = $response->getCookie('cc_alumno', false)->getValue();
        $this->asStudent($token)->getJson('/api/yo')->assertOk()->assertJsonPath('student.classroom', '4° B');
        $this->noCookies()->getJson('/api/yo')->assertOk()->assertJsonPath('student', null);
    }

    public function test_nombres_repetidos_e_invalidos(): void
    {
        $classroom = $this->classroom($this->teacherCookie());
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Ana'])->assertCreated();
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'ana'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Ana M.'])->assertCreated();
        foreach (['A', 'Ana123', '<script>', str_repeat('a', 31), 'Pendejo'] as $bad) {
            $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => $bad])->assertUnprocessable()->assertJsonValidationErrors('name');
        }
    }

    public function test_grupo_cerrado_no_acepta_nuevos_y_codigo_nuevo_no_saca_a_nadie(): void
    {
        $teacher = $this->teacherCookie();
        $classroom = $this->classroom($teacher);
        $student = $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Luis'])->getCookie('cc_alumno', false)->getValue();
        $this->asTeacher($teacher)->putJson("/api/docente/grupos/{$classroom['id']}", ['open' => false])->assertOk()->assertJsonPath('classroom.open', false);
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Pedro'])->assertUnprocessable()->assertJsonValidationErrors('code');
        $new = $this->asTeacher($teacher)->postJson("/api/docente/grupos/{$classroom['id']}/codigo")->assertOk()->json('classroom.code');
        $this->assertNotSame($classroom['code'], $new);
        $this->asStudent($student)->getJson('/api/yo')->assertJsonPath('student.name', 'Luis');
    }

    public function test_codigo_personal_en_otro_equipo(): void
    {
        $teacher = $this->teacherCookie();
        $classroom = $this->classroom($teacher);
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Sofía'])->assertCreated();
        $list = $this->asTeacher($teacher)->getJson("/api/docente/grupos/{$classroom['id']}/alumnos")->assertOk()->json('students');
        $code = $list[0]['return_code'];
        $this->assertMatchesRegularExpression('/^[A-HJ-NP-Z]{3}-[2-9]{3}$/', $code);
        $this->postJson('/api/regresar', ['code' => 'ZZZ-999'])->assertUnprocessable();
        $response = $this->postJson('/api/regresar', ['code' => strtolower(str_replace('-', ' ', $code))])->assertOk()->assertJsonPath('student.name', 'Sofía');
        $this->asStudent($response->getCookie('cc_alumno', false)->getValue())->getJson('/api/yo')->assertJsonPath('student.name', 'Sofía');
    }

    public function test_regresar_se_bloquea_tras_muchos_intentos(): void
    {
        for ($i = 0; $i < 30; $i++) {
            $this->postJson('/api/regresar', ['code' => 'ZZZ-99'.($i % 8 + 2)])->assertUnprocessable();
        }
        $this->postJson('/api/regresar', ['code' => 'ZZZ-999'])->assertStatus(429);
    }

    public function test_cuarto_equipo_cierra_la_sesion_mas_vieja(): void
    {
        $classroom = $this->classroom($this->teacherCookie());
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Mia'])->assertCreated();
        $student = Student::first();
        $code = $student->returnCode();
        $tokens = [];
        $this->travel(-10)->minutes();
        DB::table('device_sessions')->update(['created_at' => now()]);
        $this->travelBack();
        foreach (range(1, 3) as $i) {
            $tokens[] = $this->postJson('/api/regresar', ['code' => $code])->getCookie('cc_alumno', false)->getValue();
        }
        $this->assertSame(3, DB::table('device_sessions')->where('kind', 'student')->whereNull('revoked_at')->count());
        $this->assertSame(1, DB::table('device_sessions')->where('kind', 'student')->whereNotNull('revoked_at')->count());
        foreach ($tokens as $token) {
            $this->asStudent($token)->getJson('/api/yo')->assertJsonPath('student.name', 'Mia');
        }
    }

    public function test_cookie_caducada_revocada_o_de_otro_tipo(): void
    {
        $teacher = $this->teacherCookie($t);
        $this->asStudent($teacher)->getJson('/api/yo')->assertJsonPath('student', null);
        $classroom = $this->classroom($teacher);
        $token = $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Leo'])->getCookie('cc_alumno', false)->getValue();
        DB::table('device_sessions')->where('token_hash', hash('sha256', $token))->update(['expires_at' => now()->subDay()]);
        $this->asStudent($token)->getJson('/api/yo')->assertJsonPath('student', null);
        DB::table('device_sessions')->where('token_hash', hash('sha256', $token))->update(['expires_at' => now()->addDay(), 'revoked_at' => now()]);
        $this->asStudent($token)->getJson('/api/yo')->assertJsonPath('student', null);
        $this->asStudent('no-es-un-token')->getJson('/api/yo')->assertJsonPath('student', null);
    }

    public function test_salir_y_reiniciar_acceso(): void
    {
        $teacher = $this->teacherCookie();
        $classroom = $this->classroom($teacher);
        $token = $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Iker'])->getCookie('cc_alumno', false)->getValue();
        $student = Student::first();
        $old = $student->returnCode();
        $reset = $this->asTeacher($teacher)->postJson("/api/docente/alumnos/{$student->id}/acceso")->assertOk();
        $this->assertSame(1, $reset->json('closed_sessions'));
        $this->assertNotSame($old, $reset->json('return_code'));
        $this->asStudent($token)->getJson('/api/yo')->assertJsonPath('student', null);
        $token = $this->postJson('/api/regresar', ['code' => $reset->json('return_code')])->getCookie('cc_alumno', false)->getValue();
        $this->asStudent($token)->postJson('/api/yo/salir')->assertOk();
        $this->asStudent($token)->getJson('/api/yo')->assertJsonPath('student', null);
    }

    public function test_peticiones_de_otro_sitio_se_rechazan(): void
    {
        $classroom = $this->classroom($this->teacherCookie());
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Eva'])->assertCreated();
        $token = DeviceAuth::issue(request(), 'student', Student::first()->id)->getValue();
        $this->asStudent($token)->withHeaders(['Origin' => 'https://otro-sitio.com'])->postJson('/api/yo/salir')->assertForbidden();
        $this->asStudent($token)->withHeaders(['Origin' => 'http://localhost'])->postJson('/api/yo/salir')->assertOk();
    }

    public function test_docente_corrige_nombre_y_borra_alumno(): void
    {
        $teacher = $this->teacherCookie();
        $classroom = $this->classroom($teacher);
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Jose'])->assertCreated();
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Paty'])->assertCreated();
        [$jose, $paty] = Student::orderBy('id')->get()->all();
        $this->asTeacher($teacher)->putJson("/api/docente/alumnos/{$jose->id}", ['name' => 'paty'])->assertUnprocessable();
        $this->asTeacher($teacher)->putJson("/api/docente/alumnos/{$jose->id}", ['name' => 'José Luis'])->assertOk();
        $this->asTeacher($teacher)->deleteJson("/api/docente/alumnos/{$paty->id}")->assertOk();
        $this->assertDatabaseMissing('students', ['id' => $paty->id]);
        $other = $this->teacherCookie();
        $this->asTeacher($other)->deleteJson("/api/docente/alumnos/{$jose->id}")->assertNotFound();
    }

    public function test_archivar_libera_el_codigo_y_borra_nombres_despues_del_plazo(): void
    {
        $teacher = $this->teacherCookie();
        $classroom = $this->classroom($teacher);
        $this->postJson('/api/unirse', ['code' => $classroom['code'], 'name' => 'Nora'])->assertCreated();
        $this->asTeacher($teacher)->postJson("/api/docente/grupos/{$classroom['id']}/archivar")->assertOk()->assertJsonPath('classroom.code', null);
        $this->getJson("/api/unirse/{$classroom['code']}")->assertNotFound();
        $this->assertSame(0, Privacy::anonymizeOldClassrooms());
        Classroom::find($classroom['id'])->forceFill(['archived_at' => now()->subDays(61)])->save();
        $this->assertSame(1, Privacy::anonymizeOldClassrooms());
        $this->assertDatabaseMissing('students', ['name' => 'Nora']);
        $this->assertNull(Student::first()->return_code_hash);
    }
}
