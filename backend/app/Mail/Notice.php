<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

// Correo sencillo: un saludo, unas líneas y, si hace falta, un botón.
class Notice extends Mailable
{
    public function __construct(
        public string $title,
        public array $lines,
        public ?string $actionText = null,
        public ?string $actionUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->title.' · Cuenca Cimarrona');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.notice', text: 'mail.notice-text');
    }
}
