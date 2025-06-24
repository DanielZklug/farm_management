<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PoultryFarmSeeder extends Seeder
{
    public function run()
    {
        // Chemin vers votre fichier SQL
        $sqlFile = database_path('sql/poultry_farm_init.sql');
        
        if (!File::exists($sqlFile)) {
            $this->command->error("Le fichier SQL n'existe pas: ".$sqlFile);
            return;
        }

        $this->command->info('Début de l\'exécution du script SQL...');

        // Désactiver temporairement les contraintes
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Exécuter le script SQL complet
        $sql = File::get($sqlFile);
        DB::unprepared($sql);

        // Réactiver les contraintes
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Script SQL exécuté avec succès!');
        
        // Optionnel: Vérification
        $userCount = DB::table('users')->count();
        $this->command->info("$userCount utilisateurs créés");
    }
}