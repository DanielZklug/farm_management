<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'farm_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'farm_name' => $request->farm_name,
        ]);

        // Créer les catégories par défaut
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
        $user->farmData()->create(['total_chickens' => 0]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Inscription réussie'
        ], 201);
    }

    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        throw ValidationException::withMessages([
            'email' => ['Les informations d\'identification fournies sont incorrectes.'],
        ]);
    }

    $user = User::find(Auth::id());
    
    // Révoquer tous les tokens existants si nécessaire (optionnel)
    // $user->tokens()->delete();
    
    // Créer un nouveau token avec un nom unique (incluant par exemple la date)
    $tokenName = 'auth_token_' . now()->timestamp;
    $token = $user->createToken($tokenName)->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
        'message' => 'Connexion réussie'
    ]);
}

    public function logout(Request $request)
    {
        $user = $request->user();
        $tokenId = $user->currentAccessToken()?->id;

        if ($tokenId) {
            $user->tokens()->where('id', $tokenId)->delete();
        }

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
  
}