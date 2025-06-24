<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Créer un utilisateur de test
        $testUser = User::create([
            'name' => 'Administrateur Ferme',
            'email' => 'admin@ferme.com',
            'password' => Hash::make('ferme2024'),
            'farm_name' => 'Ferme de Démonstration',
        ]);

        // Créer les catégories par défaut pour l'utilisateur de test
        $defaultCategories = [
            ['name' => 'Alimentation', 'color' => 'bg-amber-100 text-amber-800', 'is_default' => true],
            ['name' => 'Médicaments', 'color' => 'bg-red-100 text-red-800', 'is_default' => true],
            ['name' => 'Équipement', 'color' => 'bg-blue-100 text-blue-800', 'is_default' => true],
            ['name' => 'Main-d\'œuvre', 'color' => 'bg-purple-100 text-purple-800', 'is_default' => true],
            ['name' => 'Services publics', 'color' => 'bg-green-100 text-green-800', 'is_default' => true],
            ['name' => 'Marketing', 'color' => 'bg-pink-100 text-pink-800', 'is_default' => true],
            ['name' => 'Autre', 'color' => 'bg-gray-100 text-gray-800', 'is_default' => true],
        ];

        foreach ($defaultCategories as $category) {
            $testUser->expenseCategories()->create($category);
        }

        // Créer les données de ferme par défaut
        $testUser->farmData()->create(['total_chickens' => 500]);
    }
}
