<!doctype html>
<html lang="es">
<body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1c2621">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
    <tr><td style="background:#00723f;padding:20px 24px;border-radius:14px 14px 0 0">
        <span style="color:#ffffff;font-size:22px;font-weight:bold">Cuenca Cimarrona</span>
    </td></tr>
    <tr><td style="padding:24px;border:2px solid #e6f4ec;border-top:0;border-radius:0 0 14px 14px">
        <h1 style="margin:0 0 16px;font-size:24px;color:#003d24">{{ $title }}</h1>
        @foreach ($lines as $line)
            <p style="margin:0 0 14px;font-size:16px;line-height:1.5">{{ $line }}</p>
        @endforeach
        @if ($actionUrl)
            <p style="margin:24px 0">
                <a href="{{ $actionUrl }}" style="display:inline-block;background:#00723f;color:#ffffff;padding:14px 22px;border-radius:14px;font-weight:bold;text-decoration:none">{{ $actionText }}</a>
            </p>
            <p style="margin:0;font-size:13px;color:#4a5650">Si el botón no abre, copia esta dirección en tu navegador: {{ $actionUrl }}</p>
        @endif
    </td></tr>
</table>
</body>
</html>
