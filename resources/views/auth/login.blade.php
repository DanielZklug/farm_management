@extends('layouts.app')

@section('title', 'Connexion - Gestionnaire de Ferme')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-lock text-2xl text-green-600"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Gestionnaire de Ferme Avicole</h1>
            <p class="text-gray-600">Accédez à votre tableau de bord</p>
        </div>

        <!-- Informations d'identification de test -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
                <i class="fas fa-info-circle text-blue-600 mt-1"></i>
                <div>
                    <p class="font-medium text-blue-800 text-sm">Compte de démonstration</p>
                    <p class="text-blue-700 text-sm mt-1">
                        Email : <code class="bg-blue-100 px-1 rounded">admin@ferme.com</code><br />
                        Mot de passe : <code class="bg-blue-100 px-1 rounded">ferme2024</code>
                    </p>
                </div>
            </div>
        </div>

        <form method="POST" action="{{ route('login') }}" class="space-y-6">
            @csrf
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <div class="relative">
                    <i class="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                        type="email" 
                        name="email" 
                        value="{{ old('email') }}"
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent @error('email') border-red-500 @enderror"
                        placeholder="Saisissez votre email"
                        required
                    >
                </div>
                @error('email')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div class="relative" x-data="{ showPassword: false }">
                    <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                        :type="showPassword ? 'text' : 'password'"
                        name="password"
                        class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent @error('password') border-red-500 @enderror"
                        placeholder="Saisissez votre mot de passe"
                        required
                    >
                    <button 
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                </div>
                @error('password')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex items-center">
                <input type="checkbox" name="remember" id="remember" class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                <label for="remember" class="ml-2 block text-sm text-gray-900">Se souvenir de moi</label>
            </div>

            <button 
                type="submit"
                class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
            >
                Se connecter
            </button>

            <div class="text-center">
                <a href="{{ route('register') }}" class="text-green-600 hover:text-green-700 text-sm font-medium">
                    Besoin d'un compte ? Inscrivez-vous
                </a>
            </div>
        </form>
    </div>
</div>
@endsection