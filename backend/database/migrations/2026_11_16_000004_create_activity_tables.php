<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 60)->unique();
            $table->string('title', 120);
            $table->string('kind', 20);
            $table->string('mode', 20);
            $table->unsignedSmallInteger('points');
            $table->string('route', 160);
            $table->unsignedInteger('min_seconds')->default(0);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('active')->default(true);
            $table->timestampsTz();
        });
        Schema::create('activity_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('activity_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('text', 300);
            $table->json('options');
            $table->unsignedTinyInteger('answer');
            $table->timestampsTz();
        });
        Schema::create('activity_starts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('started_at');
            $table->unique(['student_id', 'activity_id']);
        });
        Schema::create('completions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('points');
            $table->timestampTz('completed_at')->index();
            // Cada actividad suma una sola vez por alumno, aunque lleguen dos avisos a la vez.
            $table->unique(['student_id', 'activity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('completions');
        Schema::dropIfExists('activity_starts');
        Schema::dropIfExists('activity_questions');
        Schema::dropIfExists('activities');
    }
};
