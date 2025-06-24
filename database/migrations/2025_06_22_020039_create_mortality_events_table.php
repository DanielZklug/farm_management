<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mortality_events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->index('idx_user_id');
            $table->date('date')->index('idx_date');
            $table->enum('cause', ['maladie', 'predateur', 'accident', 'naturel', 'inconnu'])->index('idx_cause');
            $table->integer('count');
            $table->text('description');
            $table->integer('estimated_loss')->comment('Perte estimée en FCFA');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();

            $table->index(['user_id', 'date'], 'idx_user_date_mortality');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mortality_events');
    }
};
