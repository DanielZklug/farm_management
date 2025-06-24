<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Système de Gestion de Ferme Avicole')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    @auth
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center gap-8">
                        <div class="flex items-center gap-2">
                            <div class="bg-green-600 p-2 rounded-lg">
                                <i class="fas fa-egg text-white"></i>
                            </div>
                            <span class="text-xl font-bold text-gray-900">Gestionnaire de Ferme</span>
                        </div>
                        
                        <div class="flex space-x-1">
                            <a href="{{ route('dashboard') }}" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 {{ request()->routeIs('dashboard') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }}">
                                <i class="fas fa-chart-bar w-4 h-4"></i>
                                Tableau de bord
                            </a>
                            <a href="{{ route('expenses.index') }}" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 {{ request()->routeIs('expenses.*') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }}">
                                <i class="fas fa-dollar-sign w-4 h-4"></i>
                                Dépenses
                            </a>
                            <a href="{{ route('revenues.index') }}" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 {{ request()->routeIs('revenues.*') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }}">
                                <i class="fas fa-trending-up w-4 h-4"></i>
                                Revenus
                            </a>
                            <a href="{{ route('mortality.index') }}" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 {{ request()->routeIs('mortality.*') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }}">
                                <i class="fas fa-exclamation-triangle w-4 h-4"></i>
                                Mortalité
                            </a>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600">Bonjour, {{ auth()->user()->name }}</span>
                        <form method="POST" action="{{ route('logout') }}" class="inline">
                            @csrf
                            <button type="submit" class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200">
                                <i class="fas fa-sign-out-alt w-4 h-4"></i>
                                Déconnexion
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    @endauth

    <main class="@auth max-w-7xl mx-auto @endauth">
        @if(session('success'))
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg m-4" x-data="{ show: true }" x-show="show" x-transition>
                <div class="flex justify-between items-center">
                    <span>{{ session('success') }}</span>
                    <button @click="show = false" class="text-green-500 hover:text-green-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4" x-data="{ show: true }" x-show="show" x-transition>
                <div class="flex justify-between items-center">
                    <span>{{ session('error') }}</span>
                    <button @click="show = false" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        @endif

        @yield('content')
    </main>

    <script>
        // Configuration CSRF pour les requêtes AJAX
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}'
        };
    </script>
</body>
</html>