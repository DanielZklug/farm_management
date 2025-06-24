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
        DB::statement("CREATE VIEW `user_financial_stats` AS select `u`.`id` AS `id`,`u`.`name` AS `name`,`u`.`farm_name` AS `farm_name`,`u`.`role` AS `role`,`u`.`status` AS `status`,`fd`.`total_chickens` AS `total_chickens`,coalesce(sum(`r`.`total_amount`),0) AS `total_revenue`,coalesce(sum(`e`.`amount`),0) AS `total_expenses`,coalesce(sum(`m`.`estimated_loss`),0) AS `total_mortality_loss`,coalesce(sum(`r`.`total_amount`),0) - coalesce(sum(`e`.`amount`),0) - coalesce(sum(`m`.`estimated_loss`),0) AS `net_profit`,coalesce(sum(`m`.`count`),0) AS `total_mortality_count`,case when `fd`.`total_chickens` > 0 then coalesce(sum(`m`.`count`),0) / `fd`.`total_chickens` * 100 else 0 end AS `mortality_rate` from ((((`test`.`users` `u` left join `test`.`farm_data` `fd` on(`u`.`id` = `fd`.`user_id`)) left join `test`.`revenues` `r` on(`u`.`id` = `r`.`user_id`)) left join `test`.`expenses` `e` on(`u`.`id` = `e`.`user_id`)) left join `test`.`mortality_events` `m` on(`u`.`id` = `m`.`user_id`)) group by `u`.`id`,`u`.`name`,`u`.`farm_name`,`u`.`role`,`u`.`status`,`fd`.`total_chickens`");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS `user_financial_stats`");
    }
};
