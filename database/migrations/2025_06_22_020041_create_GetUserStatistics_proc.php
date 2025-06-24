<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared("CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserStatistics`(IN userId INT)
BEGIN
    SELECT * FROM user_financial_stats WHERE id = userId;
END");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS GetUserStatistics");
    }
};
