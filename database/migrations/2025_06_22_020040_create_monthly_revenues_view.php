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
        DB::statement("CREATE VIEW `monthly_revenues` AS select `test`.`revenues`.`user_id` AS `user_id`,year(`test`.`revenues`.`date`) AS `year`,month(`test`.`revenues`.`date`) AS `month`,date_format(`test`.`revenues`.`date`,'%Y-%m') AS `month_key`,sum(`test`.`revenues`.`total_amount`) AS `monthly_revenue`,count(0) AS `transaction_count` from `test`.`revenues` group by `test`.`revenues`.`user_id`,year(`test`.`revenues`.`date`),month(`test`.`revenues`.`date`) order by `test`.`revenues`.`user_id`,year(`test`.`revenues`.`date`) desc,month(`test`.`revenues`.`date`) desc");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS `monthly_revenues`");
    }
};
