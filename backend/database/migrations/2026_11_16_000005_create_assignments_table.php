<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->date('due_date')->nullable();
            $table->timestampTz('created_at');
            $table->unique(['classroom_id', 'activity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
