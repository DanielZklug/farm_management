<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminPanelController extends Controller
{
    public function getAllUsers(Request $request)
    {

        $users = User::select('id', 'name', 'email', 'farm_name', 'role', 'status', 'created_at')
                    ->withCount('expenseCategories')
                    ->latest()
                    ->get();

        return response()->json([
            'users' => $users,
            'count' => $users->count()
        ]);
    }
     public function addUser(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6',
        'farm_name' => 'nullable|string|max:255',
        'role' => ['required', Rule::in(['admin', 'manager', 'user'])],
        'status' => ['required', Rule::in(['active', 'bloqued', 'pending'])],
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'farm_name' => $request->farm_name,
        'role' => $request->role,
        'status' => $request->status,
    ]);

    // Créer les catégories de dépenses par défaut
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
        $user->expenseCategories()->create($category);
    }

    // Créer les données de ferme par défaut
    $user->farmData()->create([
        'total_chickens' => 0
    ]);

    return response()->json([
        'user' => $user,
        'message' => 'Utilisateur créé avec succès'
    ], 201);
}
    public function deleteUser(int $id)
    {
        $user = User::findOrFail($id);
        
        // Supprimer les relations avant de supprimer l'utilisateur
        $user->expenseCategories()->delete();
        $user->farmData()->delete();
        
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
    // Controller
    public function toggleUserStatus($id) {
        // Protection admin principal
        if ($id === 1) {
            return response()->json(['message' => 'Action interdite'], 403);
        }

        $user = User::findOrFail($id);
        $user->update([
            'status' => $user->status === 'active' ? 'blocked' : 'active'
        ]);
        
        return response()->noContent();
    }
     public function updateUser(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|string|min:6',
            'farm_name' => 'nullable|string|max:255',
            'role' => ['sometimes', Rule::in(['admin', 'manager', 'user'])],
            'status' => ['sometimes', Rule::in(['active', 'bloqued', 'pending'])],
        ]);

        $updateData = $request->only(['name', 'email', 'farm_name', 'role', 'status']);

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'user' => $user,
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }
    public function importCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimetypes:text/csv,text/plain|max:2048', // 2MB max
            'user_id' => 'required|exists:users,id'
        ], [
            'csv_file.required' => 'Aucun fichier CSV sélectionné',
            'csv_file.mimetypes' => 'Le fichier doit être de type CSV',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier les permissions
        // if (!$request->user()->isAdmin()) {
        //     return response()->json(['message' => 'Action non autorisée'], 403);
        // }

        return DB::transaction(function () use ($request) {
            $user = User::findOrFail($request->user_id);
            $file = $request->file('csv_file');
            $results = $this->processCsv($request,$file, $user);

            return response()->json([
                'message' => 'Importation réussie',
                'stats' => $results
            ]);
        });
    }

   private function processCsv(Request $request, $file, $user)
{
    $path = $file->getRealPath();
    $fileContent = file_get_contents($path);
    $lines = explode("\n", $fileContent);

    $stats = [
        'expenses' => 0,
        'revenues' => 0,
        'mortality' => 0,
        'total_chickens' => 0
    ];

    // Réinitialiser les données existantes
    $user->expenses()->delete();
    $user->revenues()->delete();
    $user->mortalityEvents()->delete();

    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;

        // Détection du type de ligne
        if (str_starts_with($line, 'TYPE,')) continue; // Skip header
        if (str_starts_with($line, '#')) continue; // Commentaire

        // Parser la ligne CSV
        $columns = str_getcsv($line);
        if (count($columns) < 5) continue;

        $type = $columns[0];
        $date = $columns[1];
        $category = $columns[2];
        $description = $columns[3];
        $amount = $columns[4];
        $extra = $columns[5] ?? null;

        switch ($type) {
            case 'EXPENSE':
                $user->expenses()->create([
                    'date' => $date,
                    'category' => $category,
                    'description' => $description,
                    'amount' => (float)$amount,
                    'frequency' => $extra ?? 'ponctuel',
                    'is_recurring' => ($extra && $extra !== 'ponctuel')
                ]);
                $stats['expenses']++;
                break;

            case 'REVENUE':
                $user->revenues()->create([
                    'date' => $date,
                    'type' => $category,
                    'description' => $description,
                    'quantity' => (int)($extra ? explode('x', $extra)[0] : 1),
                    'unit_price' => (float)($extra ? explode('x', $extra)[1] : $amount),
                    'total_amount' => (float)$amount
                ]);
                $stats['revenues']++;
                break;

            case 'MORTALITY':
                $user->mortalityEvents()->create([
                    'date' => $date,
                    'cause' => $category,
                    'description' => $description,
                    'estimated_loss' => (float)$amount,
                    'count' => (int)($extra ?? 1)
                ]);
                $stats['mortality']++;
                break;

            case 'TOTAL_CHICKENS':
                $stats['total_chickens'] = (int)$amount;
                $user->farmData()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['total_chickens' => (int)$amount]
                );
                break;
        }
    }

    return $stats;
}
}
