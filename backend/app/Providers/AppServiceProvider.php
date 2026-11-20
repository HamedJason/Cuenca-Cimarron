<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cada grupo de rutas cuenta aparte. Los límites son altos porque una escuela entera
        // sale a internet con la misma IP. Solo frenan abusos.
        foreach (['publico' => 600, 'cuentas' => 300, 'aula' => 1200, 'codigos' => 300] as $name => $perMinute) {
            RateLimiter::for($name, fn (Request $request) => Limit::perMinute($perMinute)->by($name.'|'.$request->ip()));
        }
        // La zona del visitante se manda una sola vez por navegador: un salón entero cabe de sobra.
        RateLimiter::for('zona', fn (Request $request) => Limit::perMinute(60)->by('zona|'.$request->ip()));
    }
}
