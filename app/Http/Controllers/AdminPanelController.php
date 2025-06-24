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
    public function importCsv(Request $request, int $userId)
{
    // Validation des données
    $validator = Validator::make($request->all(), [
        'totalChickens' => 'sometimes|integer|min:0',
        'expenses' => 'sometimes|array',
        'expenses.*.date' => 'required|date',
        'expenses.*.amount' => 'required|numeric|min:0',
        'revenues' => 'sometimes|array',
        'revenues.*.date' => 'required|date',
        'revenues.*.total_amount' => 'required|numeric|min:0',
        'mortality' => 'sometimes|array',
        'mortality.*.date' => 'required|date',
        'monthlyFinancials' => 'sometimes|array'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    return DB::transaction(function () use ($userId, $request) {
        $user = User::findOrFail($userId);

        // Suppression des anciennes données
        $user->expenses()->delete();
        $user->revenues()->delete();
        $user->mortalityEvents()->delete();

        // Insertion des nouvelles données
        if (!empty($request->expenses)) {
            $user->expenses()->createMany($request->expenses);
        }

        if (!empty($request->revenues)) {
            $user->revenues()->createMany($request->revenues);
        }

        if (!empty($request->mortality)) {
            $user->mortalityEvents()->createMany($request->mortality);
        }

        // Mise à jour du nombre total de poulets
        if ($request->has('totalChickens')) {
            $user->farmData()->updateOrCreate(
                ['user_id' => $user->id],
                ['total_chickens' => $request->totalChickens]
            );
        }

        return response()->json([
            'message' => 'Données importées avec succès',
            'stats' => [
                'total_chickens' => $request->totalChickens ?? 0,
                'expenses' => count($request->expenses ?? []),
                'revenues' => count($request->revenues ?? []),
                'mortality' => count($request->mortality ?? []),
                'monthly_financials' => count($request->monthlyFinancials ?? [])
            ]
        ]);
    });
}
}
