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
        Schema::create('expenses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->index('idx_user_id');
            $table->date('date')->index('idx_date');
            $table->string('category')->index('idx_category');
            $table->text('description');
            $table->integer('amount')->comment('Montant en FCFA (sans décimales)');
            $table->enum('frequency', ['ponctuel', 'quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel'])->nullable()->default('ponctuel')->index('idx_frequency');
            $table->date('next_due_date')->nullable();
            $table->boolean('is_recurring')->nullable()->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();

            $table->index(['user_id', 'category'], 'idx_user_category_expense');
            $table->index(['user_id', 'date'], 'idx_user_date_expense');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
