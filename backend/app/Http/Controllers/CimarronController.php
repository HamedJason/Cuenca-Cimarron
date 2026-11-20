<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Support\Cimacoins;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Mi cimarrón de los alumnos con sesión: avatar, premios, retos, secreto y compras.
// Los visitantes sin cuenta usan la misma tienda, pero su cartera vive en su navegador.
class CimarronController extends Controller
{
    // Cambia la cartera del alumno con el registro bloqueado, para que dos pestañas
    // no gasten o cobren lo mismo dos veces.
    private function mutate(Request $request, callable $change): JsonResponse
    {
        $id = $request->attributes->get('student')->id;

        return DB::transaction(function () use ($id, $change): JsonResponse {
            $student = Student::whereKey($id)->lockForUpdate()->firstOrFail();
            $wallet = Cimacoins::stored($student);
            $result = $change($wallet, $student) ?? [];
            $student->wallet = $wallet;
            $student->save();

            return response()->json([
                'wallet' => Cimacoins::forClient($student, $wallet),
                'avatar' => Cimacoins::avatar($student, $wallet),
            ] + $result);
        });
    }

    // Guarda el avatar. Solo se acepta lo que ya es suyo.
    public function save(Request $request): JsonResponse
    {
        $groups = array_keys(config('avatar.defaults'));
        $data = $request->validate([
            'avatar' => ['required', 'array:'.implode(',', $groups)],
            'avatar.*' => ['string', 'max:40'],
        ]);

        return $this->mutate($request, function (array &$wallet, Student $student) use ($data): void {
            foreach ($data['avatar'] as $group => $id) {
                $key = "{$group}/{$id}";
                if (Cimacoins::price($key) === false || ! Cimacoins::owns($wallet, $key)) {
                    throw ValidationException::withMessages(['avatar' => 'Esa pieza todavía no es tuya.']);
                }
            }
            $student->avatar = Cimacoins::avatar($student, $wallet, $data['avatar']);
        });
    }

    // Premio del sitio: abrir o terminar un juego, moneda escondida, listas completas, visita del día...
    public function reward(Request $request): JsonResponse
    {
        $id = $request->validate(['id' => ['required', 'string', 'max:40']])['id'];
        $reward = config("avatar.rewards.{$id}");
        if (! is_array($reward)) {
            return response()->json(['message' => 'Ese premio no existe.'], 404);
        }

        // Premio por terminar un juego: solo si el alumno ya tiene esa actividad completa.
        $activity = $reward['activity'] ?? null;
        if (is_string($activity) && ! ActivityController::isCompleted($request->attributes->get('student')->id, $activity)) {
            return response()->json(['message' => 'Primero termina el juego.'], 422);
        }

        return $this->mutate($request, function (array &$wallet) use ($id, $reward): array {
            $today = Cimacoins::today();
            $already = $reward['daily'] ? ($wallet['daily_claims'][$id] ?? '') === $today : in_array($id, $wallet['claimed'], true);
            if ($already) {
                return ['new' => false];
            }
            $wallet['bonus'] += $reward['coins'];
            $wallet['owned'] = array_values(array_unique([...$wallet['owned'], ...$reward['items']]));
            if ($reward['daily']) {
                $wallet['daily_claims'][$id] = $today;
            } else {
                $wallet['claimed'][] = $id;
            }

            return ['new' => true, 'coins' => $reward['coins']];
        });
    }

    // Reto de memoria de "Ganar monedas". La secuencia la revisa la página.
    public function challenge(Request $request): JsonResponse
    {
        $id = $request->validate(['id' => ['required', 'string', 'max:40']])['id'];
        $reto = config("avatar.retos.{$id}");
        if (! is_array($reto)) {
            return response()->json(['message' => 'Ese reto no existe.'], 404);
        }

        return $this->mutate($request, function (array &$wallet) use ($id, $reto): array {
            $today = Cimacoins::today();
            if ($reto['daily'] ? $wallet['daily'] === $today : in_array($id, $wallet['completed'], true)) {
                return ['new' => false];
            }
            $wallet['bonus'] += $reto['coins'];
            if ($reto['daily']) {
                $wallet['daily'] = $today;
            } else {
                $wallet['completed'][] = $id;
            }

            return ['new' => true, 'coins' => $reto['coins']];
        });
    }

    // Secreto del Cimarrón Angelical: los tres fragmentos de los retos en su orden.
    public function secret(Request $request): JsonResponse
    {
        $data = $request->validate(['answer' => ['required', 'array', 'max:10'], 'answer.*' => ['string', 'max:10']]);

        return $this->mutate($request, function (array &$wallet) use ($data): array {
            if ($wallet['angelic']) {
                return ['new' => false];
            }
            $clues = array_keys(array_filter(config('avatar.retos'), fn ($r) => $r['clue']));
            $found = count(array_intersect($clues, $wallet['completed'])) === count($clues);
            if (! $found || array_values($data['answer']) !== config('avatar.secret.pattern')) {
                throw ValidationException::withMessages(['answer' => 'Las señales no encajan. Revisa los números de los fragmentos.']);
            }
            $wallet['angelic'] = true;
            $wallet['owned'] = array_values(array_unique([...$wallet['owned'], ...config('avatar.secret.items')]));

            return ['new' => true];
        });
    }

    // Compra de una pieza ({group, id}) o de un kit completo ({kit}).
    public function buy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kit' => ['required_without:group', 'nullable', 'string', 'max:40'],
            'group' => ['required_without:kit', 'nullable', 'string', 'max:40'],
            'id' => ['required_with:group', 'nullable', 'string', 'max:40'],
        ]);
        if (! empty($data['kit'])) {
            $state = config('avatar.kits.'.$data['kit']);
            if (! is_array($state)) {
                return response()->json(['message' => 'Ese kit no existe.'], 404);
            }
        } else {
            $key = "{$data['group']}/{$data['id']}";
            if (Cimacoins::price($key) === false) {
                return response()->json(['message' => 'Esa pieza no existe.'], 404);
            }
            $state = [$data['group'] => $data['id']];
        }

        return $this->mutate($request, function (array &$wallet, Student $student) use ($state, $data): array {
            $price = ! empty($data['kit']) ? Cimacoins::kitPrice($wallet, $state) : Cimacoins::price(array_key_first($state).'/'.reset($state));
            $keys = array_map(fn ($group) => "{$group}/{$state[$group]}", array_keys($state));
            $missing = array_filter($keys, fn ($key) => ! Cimacoins::owns($wallet, $key));
            if (! $missing) {
                return ['new' => false];
            }
            if (! is_int($price)) {
                throw ValidationException::withMessages(['id' => 'Eso no se vende: se gana en el sitio o con un secreto.']);
            }
            if ($price > Cimacoins::coins($student, $wallet)) {
                throw ValidationException::withMessages(['id' => 'Te faltan Cimacoins para comprarlo.']);
            }
            $wallet['spent'] += $price;
            $wallet['owned'] = array_values(array_unique([...$wallet['owned'], ...array_filter($missing, fn ($key) => Cimacoins::price($key) > 0)]));

            return ['new' => true, 'price' => $price];
        });
    }
}
