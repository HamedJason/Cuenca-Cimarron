<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['application' => 'Cuenca Cimarrona', 'api' => '/api/stats']);
});
