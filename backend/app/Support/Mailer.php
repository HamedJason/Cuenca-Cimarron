<?php

namespace App\Support;

use App\Mail\Notice;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Testing\Fakes\MailFake;
use Illuminate\Support\Facades\Mail;

// Manda correos con el servidor SMTP que se llena en el panel de administración.
// Si todavía no hay servidor configurado, el correo solo queda en el registro de la API.
class Mailer
{
    public static function configured(): bool
    {
        return (bool) Settings::get('mail_host');
    }

    public static function send(string $to, Notice $mail): bool
    {
        $mailer = 'log';
        if (self::configured()) {
            $encryption = Settings::get('mail_encryption', 'tls');
            config([
                'mail.mailers.ajustes' => [
                    'transport' => 'smtp',
                    'scheme' => $encryption === 'ssl' ? 'smtps' : 'smtp',
                    'host' => Settings::get('mail_host'),
                    'port' => (int) Settings::get('mail_port', $encryption === 'ssl' ? 465 : 587),
                    'username' => Settings::get('mail_username'),
                    'password' => Settings::get('mail_password'),
                    'timeout' => 15,
                ],
            ]);
            if (! Mail::getFacadeRoot() instanceof MailFake) {
                Mail::purge('ajustes');
            }
            $mailer = 'ajustes';
        }
        config(['mail.from' => [
            'address' => Settings::get('mail_from_address') ?: Settings::get('mail_username') ?: 'no-responder@cuenca.local',
            'name' => Settings::get('mail_from_name') ?: 'Cuenca Cimarrona',
        ]]);

        try {
            Mail::mailer($mailer)->to($to)->send($mail);

            return $mailer !== 'log';
        } catch (\Throwable $e) {
            Log::warning('No se pudo mandar el correo', ['error' => $e->getMessage()]);

            return false;
        }
    }
}
