@extends('layouts.app')

@section('title', 'Inscription - Gestionnaire de Ferme')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-user-plus text-2xl text-green-600"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Gestionnaire de Ferme Avicole</h1>
            <p class="text-gray-600">Créez votre compte</p>
        </div>

        <form method="POST" action="{{ route('register') }}" class="space-y-6">
            @csrf
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <div class="relative">
                    <i class="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                        type="text" 
                        name="name" 
                        value="{{ old('name') }}"
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent @error('name') border-red-500 @enderror"
                        placeholder="Saisissez votre nom complet"
                        required
                    >
                </div>
                @error('name')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la ferme (optionnel)</label>
                <input 
                    type="text" 
                    name="farm_name" 
                    value="{{ old('farm_name') }}"
                    class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom de votre ferme"
                >
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <div class="relative">
                    <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div class="relative">
                    <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                        type="password"
                        name="password_confirmation"
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Confirmez votre mot de passe"
                        required
                    >
                </div>
            </div>

            <button 
                type="submit"
                class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
            >
                Créer un compte
            </button>

            <div class="text-center">
                <a href="{{ route('login') }}" class="text-green-600 hover:text-green-700 text-sm font-medium">
                    Vous avez déjà un compte ? Connectez-vous
                </a>
            </div>
        </form>
    </div>
</div>
@endsection