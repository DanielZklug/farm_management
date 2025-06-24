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
        Schema::create('revenues', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->index('idx_user_id');
            $table->date('date')->index('idx_date');
            $table->enum('type', ['oeufs', 'poulets', 'fonds-externes', 'subventions', 'aides-agricoles', 'autre'])->index('idx_type');
            $table->text('description');
            $table->integer('quantity');
            $table->integer('unit_price')->comment('Prix unitaire en FCFA');
            $table->integer('total_amount')->comment('Montant total en FCFA');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();

            $table->index(['user_id', 'date'], 'idx_user_date_revenue');
            $table->index(['user_id', 'type'], 'idx_user_type_revenue');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenues');
    }
};
