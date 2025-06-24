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
        DB::unprepared("CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMonthlyFinancialReport`(IN userId INT, IN limitMonths INT)
BEGIN
    SELECT 
        mr.month_key,
        mr.year,
        mr.month,
        COALESCE(mr.monthly_revenue, 0) as total_revenue,
        COALESCE(me.monthly_expenses, 0) as total_expenses,
        (COALESCE(mr.monthly_revenue, 0) - COALESCE(me.monthly_expenses, 0)) as net_income
    FROM monthly_revenues mr
    LEFT JOIN monthly_expenses me ON mr.user_id = me.user_id AND mr.month_key = me.month_key
    WHERE mr.user_id = userId
    ORDER BY mr.year DESC, mr.month DESC
    LIMIT limitMonths;
END");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS GetMonthlyFinancialReport");
    }
};
