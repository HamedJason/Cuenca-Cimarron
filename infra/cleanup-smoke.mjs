import { execFileSync } from 'node:child_process'
export function cleanupSmokeVisitor(visitor) {
 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitor)) throw new Error('UUID de prueba inválido')
 const php = `require 'vendor/autoload.php'; $app = require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); Illuminate\\Support\\Facades\\DB::table('visitors')->where('id', hash_hmac('sha256', '${visitor}', config('app.key')))->delete();`
 execFileSync('docker', ['compose', 'exec', '-T', 'backend', 'php', '-r', php], { stdio: 'pipe' })
}
if (process.argv[2]) cleanupSmokeVisitor(process.argv[2])
