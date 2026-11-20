<?php

namespace App\Support;

use App\Http\Controllers\VisitZoneController;
use App\Models\Classroom;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Datos de ejemplo para la exposición (/testeo_20nov). Todo lleva "Demo" en el nombre y las cuentas
// usan el dominio reservado de config/demo.php, así que se pueden borrar sin tocar nada real.
// seed() borra lo demo anterior y lo vuelve a crear: correrlo varias veces no duplica nada.
class DemoData
{
    public const STUDENTS = ['Ana Demo', 'Beto Demo', 'Carla Demo', 'Dani Demo', 'Eli Demo', 'Fer Demo'];

    // Visitas por zona de ejemplo para el panel "¿Desde dónde nos visitan?"
    public const ZONES = [
        ['Tijuana', 'Zona Centro', 14], ['Tijuana', 'Playas', 11], ['Tijuana', 'San Antonio de los Buenos', 9],
        ['Tijuana', 'La Presa', 8], ['Tijuana', 'Mesa de Otay', 6], ['Tijuana', 'Cerro Colorado', 5],
        ['Tijuana', 'Natura', 3], ['Rosarito', 'Rosarito', 7], ['Tecate', 'Tecate', 4],
        ['Ensenada', 'Ensenada', 5], ['Mexicali', 'Mexicali', 3], ['Fuera de Baja California', 'Fuera de Baja California', 2],
    ];

    public static function email(string $who): string
    {
        return $who.'@'.config('demo.domain');
    }

    public static function user(string $who): ?User
    {
        return User::where('email', self::email($who))->first();
    }

    public static function exists(): bool
    {
        return User::where('email', 'like', '%@'.config('demo.domain'))->exists();
    }

    public static function seed(): array
    {
        self::wipe();
        Catalog::sync();

        return DB::transaction(function (): array {
            $password = Str::random(40);
            $admin = User::create(['name' => 'Admin Demo', 'email' => self::email('admin'), 'password' => $password, 'role' => 'admin']);
            $admin->forceFill(['email_verified_at' => now()])->save();

            $approved = self::school('escuela', 'Primaria Demo Cuenca Cimarrona', 'Sánchez Taboada', 32.4895, -116.9707, 'approved', $password, $admin->id);
            self::school('pendiente', 'Secundaria Demo Cuenca Cimarrona', 'Playas de Tijuana', 32.5228, -117.1123, 'approved', $password, null);

            $teacher = new Teacher(['name' => 'Profe Demo']);
            $teacher->school_id = $approved->id;
            $teacher->avatar = ['pelaje' => 'canela', 'cabeza' => 'casco-verde'];
            $teacher->save();

            $codes = [];
            $students = [];
            foreach ([['4° A Demo', '4°'], ['5° B Demo', '5°']] as $i => [$name, $grade]) {
                $classroom = new Classroom(['name' => $name, 'grade' => $grade]);
                $classroom->teacher_id = $teacher->id;
                $wanted = config('demo.codes')[$i];
                $classroom->code = DB::table('classrooms')->where('code', $wanted)->exists() ? Classroom::newCode() : $wanted;
                $classroom->save();
                $codes[] = $classroom->code;
                foreach (array_slice(self::STUDENTS, $i * 3, 3) as $j => $studentName) {
                    $students[] = self::student($classroom, $studentName, $i * 3 + $j);
                }
            }

            $zones = [];
            foreach (self::ZONES as [$municipio, $zona, $visits]) {
                VisitZoneController::count($municipio, $zona, $visits);
                $zones[] = [$municipio, $zona, $visits];
            }
            Settings::set('demo20nov.zonas', json_encode($zones));
            Settings::set('demo20nov.codigo-alumno', $students[0]['code']);

            return ['codes' => $codes, 'students' => count($students)];
        });
    }

    private static function school(string $who, string $name, string $colonia, float $lat, float $lng, string $status, string $password, ?int $reviewer): School
    {
        $user = User::create(['name' => 'Directora Demo', 'email' => self::email($who), 'password' => $password, 'role' => 'school']);
        $user->forceFill(['email_verified_at' => now()])->save();
        $school = new School([
            'name' => $name,
            'level' => str_starts_with($name, 'Primaria') ? 'primaria' : 'secundaria',
            'shift' => 'matutino',
            'sector' => 'publica',
            'colonia' => $colonia,
            'address' => 'Calle Demo 123',
            'lat' => $lat,
            'lng' => $lng,
            'contact_name' => 'Directora Demo',
        ]);
        $school->user_id = $user->id;
        $school->families_informed_at = now();
        $school->status = $status;
        if ($reviewer) {
            $school->reviewed_by = $reviewer;
            $school->reviewed_at = now();
        }
        $school->save();

        return $school;
    }

    // Alumno con actividades completas, Cimacoins y un cimarrón con piezas compradas.
    private static function student(Classroom $classroom, string $name, int $n): array
    {
        $student = new Student(['name' => $name]);
        $student->classroom_id = $classroom->id;
        $student->name_key = Student::nameKey($name);
        $code = $student->assignReturnCode();

        // Piezas a la venta: una de cada grupo, distinta para cada alumno
        $bought = [];
        $spent = 0;
        $avatar = [];
        foreach (['pelaje', 'ojos', 'cabeza', 'espalda', 'fondo', 'mano'] as $group) {
            $options = collect(config('avatar.items'))->filter(fn ($price, $key) => str_starts_with($key, $group.'/') && is_int($price) && $price > 0 && $price <= 200)->keys()->values();
            if ($options->isEmpty()) {
                continue;
            }
            $key = $options[$n % $options->count()];
            $bought[] = $key;
            $spent += config('avatar.items')[$key];
            $avatar[$group] = substr($key, strlen($group) + 1);
        }
        $student->wallet = ['spent' => $spent, 'bonus' => [520, 340, 410, 160, 230, 90][$n] ?? 100, 'owned' => $bought, 'claimed' => [], 'daily_claims' => [], 'completed' => [], 'daily' => '', 'angelic' => false];
        $student->avatar = $avatar;
        $student->save();

        // Actividades completadas: más para los primeros alumnos
        $activities = DB::table('activities')->where('active', true)->orderBy('sort')->get(['id', 'points']);
        foreach ($activities->take([9, 7, 5, 6, 3, 2][$n] ?? 2) as $k => $activity) {
            DB::table('completions')->insert([
                'student_id' => $student->id,
                'activity_id' => $activity->id,
                'points' => $activity->points,
                'completed_at' => now()->subDays(($n + $k) % 20)->subHours($k),
            ]);
        }

        return ['id' => $student->id, 'code' => $code];
    }

    // Borra todo lo demo. Las escuelas, docentes, grupos, alumnos y sus actividades se van en cascada.
    public static function wipe(): void
    {
        DB::transaction(function (): void {
            $users = User::where('email', 'like', '%@'.config('demo.domain'))->pluck('id');
            $schools = DB::table('schools')->whereIn('user_id', $users)->pluck('id');
            $teachers = DB::table('teachers')->whereIn('school_id', $schools)->pluck('id');
            $students = DB::table('students')
                ->whereIn('classroom_id', DB::table('classrooms')->whereIn('teacher_id', $teachers)->pluck('id'))
                ->pluck('id');
            DB::table('device_sessions')->where(fn ($q) => $q
                ->where(fn ($q) => $q->where('kind', 'teacher')->whereIn('owner_id', $teachers))
                ->orWhere(fn ($q) => $q->where('kind', 'student')->whereIn('owner_id', $students)))->delete();
            DB::table('schools')->whereIn('id', $schools)->update(['reviewed_by' => null]);
            DB::table('schools')->whereIn('id', $schools)->delete();
            DB::table('users')->whereIn('id', $users)->delete();

            // Se restan las visitas por zona que puso la demo
            foreach (json_decode((string) Settings::get('demo20nov.zonas', '[]'), true) ?: [] as [$municipio, $zona, $visits]) {
                DB::table('visit_zones')->where(['municipio' => $municipio, 'zona' => $zona])->orderByDesc('day')
                    ->get()->each(function ($row) use (&$visits): void {
                        if ($visits <= 0) {
                            return;
                        }
                        $take = min($visits, (int) $row->visits);
                        DB::table('visit_zones')->where('id', $row->id)->decrement('visits', $take);
                        $visits -= $take;
                    });
            }
            DB::table('visit_zones')->where('visits', '<=', 0)->delete();
            Settings::set('demo20nov.zonas', null);
            Settings::set('demo20nov.codigo-alumno', null);
        });
    }
}
