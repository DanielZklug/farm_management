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
        DB::unprepared("CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTopFarmsByRevenue`(IN limitCount INT)
BEGIN
    SELECT 
        u.name,
        u.farm_name,
        u.role,
        SUM(r.total_amount) as total_revenue,
        COUNT(r.id) as total_transactions
    FROM users u
    INNER JOIN revenues r ON u.id = r.user_id
    WHERE u.status = 'active'
    GROUP BY u.id, u.name, u.farm_name, u.role
    ORDER BY total_revenue DESC
    LIMIT limitCount;
END");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS GetTopFarmsByRevenue");
    }
};
