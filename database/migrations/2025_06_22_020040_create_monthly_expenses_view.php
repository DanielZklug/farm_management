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
        DB::statement("CREATE VIEW `monthly_expenses` AS select `test`.`expenses`.`user_id` AS `user_id`,year(`test`.`expenses`.`date`) AS `year`,month(`test`.`expenses`.`date`) AS `month`,date_format(`test`.`expenses`.`date`,'%Y-%m') AS `month_key`,sum(`test`.`expenses`.`amount`) AS `monthly_expenses`,count(0) AS `transaction_count` from `test`.`expenses` group by `test`.`expenses`.`user_id`,year(`test`.`expenses`.`date`),month(`test`.`expenses`.`date`) order by `test`.`expenses`.`user_id`,year(`test`.`expenses`.`date`) desc,month(`test`.`expenses`.`date`) desc");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS `monthly_expenses`");
    }
};
