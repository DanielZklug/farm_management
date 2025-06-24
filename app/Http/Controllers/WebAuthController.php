<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class WebAuthController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function showRegisterForm()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
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

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Inscription réussie ! Bienvenue dans votre gestionnaire de ferme.');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'))->with('success', 'Connexion réussie !');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Déconnexion réussie !');
    }
}