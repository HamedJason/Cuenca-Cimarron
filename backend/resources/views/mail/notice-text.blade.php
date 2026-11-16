{{ $title }}

@foreach ($lines as $line)
{{ $line }}

@endforeach
@if ($actionUrl)
{{ $actionText }}: {{ $actionUrl }}
@endif

Cuenca Cimarrona
