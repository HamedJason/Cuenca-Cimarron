<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitors', function (Blueprint $table): void {
            $table->char('id', 64)->primary();
            $table->timestampTz('first_seen_at');
        });
        Schema::create('visits', function (Blueprint $table): void {
            $table->id();
            $table->char('visitor_id', 64);
            $table->char('session_id', 64);
            $table->timestampTz('created_at');
            $table->unique(['visitor_id', 'session_id']);
            $table->foreign('visitor_id')->references('id')->on('visitors')->cascadeOnDelete();
        });
        Schema::create('game_sessions', function (Blueprint $table): void {
            $table->id();
            $table->char('visitor_id', 64);
            $table->char('session_id', 64);
            $table->string('game', 80)->index();
            $table->timestampTz('started_at');
            $table->unique(['visitor_id', 'session_id', 'game']);
            $table->foreign('visitor_id')->references('id')->on('visitors')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('visitors');
    }
};
