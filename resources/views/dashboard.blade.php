@extends('layouts.app')

@section('title', 'Tableau de bord')

@section('content')
<div class="p-6">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Tableau de bord de la ferme</h1>
        <p class="text-gray-600">Vue d'ensemble de vos opérations et finances avicoles</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Revenus totaux</p>
                    <p class="text-2xl font-bold text-green-600">{{ number_format($statistics['totalRevenue'], 2) }} €</p>
                </div>
                <div class="p-3 rounded-full bg-green-100">
                    <i class="fas fa-trending-up text-green-600"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Dépenses totales</p>
                    <p class="text-2xl font-bold text-red-600">{{ number_format($statistics['totalExpenses'], 2) }} €</p>
                </div>
                <div class="p-3 rounded-full bg-red-100">
                    <i class="fas fa-trending-down text-red-600"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Bénéfice net</p>
                    <p class="text-2xl font-bold {{ $statistics['netProfit'] >= 0 ? 'text-green-600' : 'text-red-600' }}">
                        {{ number_format($statistics['netProfit'], 2) }} €
                    </p>
                </div>
                <div class="p-3 rounded-full {{ $statistics['netProfit'] >= 0 ? 'bg-green-100' : 'bg-red-100' }}">
                    <i class="fas fa-dollar-sign {{ $statistics['netProfit'] >= 0 ? 'text-green-600' : 'text-red-600' }}"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Disponible pour réinvestissement</p>
                    <p class="text-2xl font-bold text-blue-600">{{ number_format($statistics['reinvestmentAmount'], 2) }} €</p>
                </div>
                <div class="p-3 rounded-full bg-blue-100">
                    <i class="fas fa-bullseye text-blue-600"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Total de poulets</p>
                    <p class="text-2xl font-bold text-blue-600">{{ $farmData['totalChickens'] }}</p>
                </div>
                <div class="p-3 rounded-full bg-blue-100">
                    <i class="fas fa-egg text-blue-600"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Taux de mortalité</p>
                    <p class="text-2xl font-bold {{ $statistics['mortalityRate'] > 5 ? 'text-red-600' : 'text-green-600' }}">
                        {{ number_format($statistics['mortalityRate'], 1) }}%
                    </p>
                </div>
                <div class="p-3 rounded-full {{ $statistics['mortalityRate'] > 5 ? 'bg-red-100' : 'bg-green-100' }}">
                    <i class="fas fa-heartbeat {{ $statistics['mortalityRate'] > 5 ? 'text-red-600' : 'text-green-600' }}"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Aperçu financier mensuel -->
    @if(count($monthlyFinancials) > 0)
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fas fa-chart-bar text-blue-600"></i>
                <h3 class="text-lg font-semibold text-gray-900">Aperçu financier mensuel</h3>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-4 font-medium text-gray-700">Mois</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-700">Revenus</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-700">Dépenses</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-700">Revenu net</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-700">Disponible pour réinvestissement</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($monthlyFinancials as $month)
                            @php
                                $reinvestment = $month['netIncome'] > 0 ? $month['netIncome'] * 0.7 : 0;
                            @endphp
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="py-3 px-4 font-medium text-gray-900">
                                    {{ \Carbon\Carbon::parse($month['month'] . '-01')->format('M Y') }}
                                </td>
                                <td class="py-3 px-4 text-right text-green-600 font-semibold">
                                    {{ number_format($month['totalRevenue'], 2) }} €
                                </td>
                                <td class="py-3 px-4 text-right text-red-600 font-semibold">
                                    {{ number_format($month['totalExpenses'], 2) }} €
                                </td>
                                <td class="py-3 px-4 text-right font-semibold {{ $month['netIncome'] >= 0 ? 'text-green-600' : 'text-red-600' }}">
                                    {{ number_format($month['netIncome'], 2) }} €
                                </td>
                                <td class="py-3 px-4 text-right text-blue-600 font-semibold">
                                    {{ number_format($reinvestment, 2) }} €
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Dépenses récentes</h3>
            @if(count($farmData['expenses']) > 0)
                <div class="space-y-3">
                    @foreach(array_slice(array_reverse($farmData['expenses']->toArray()), 0, 5) as $expense)
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                                <p class="font-medium text-gray-900">{{ $expense['description'] }}</p>
                                <p class="text-sm text-gray-600 capitalize">{{ $expense['category'] }} • {{ \Carbon\Carbon::parse($expense['date'])->format('d/m/Y') }}</p>
                            </div>
                            <span class="text-red-600 font-semibold">-{{ number_format($expense['amount'], 2) }} €</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500 text-center py-8">Aucune dépense enregistrée</p>
            @endif
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenus récents</h3>
            @if(count($farmData['revenue']) > 0)
                <div class="space-y-3">
                    @foreach(array_slice(array_reverse($farmData['revenue']->toArray()), 0, 5) as $revenue)
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                                <p class="font-medium text-gray-900">{{ $revenue['description'] }}</p>
                                <p class="text-sm text-gray-600 capitalize">{{ $revenue['type'] }} • {{ \Carbon\Carbon::parse($revenue['date'])->format('d/m/Y') }}</p>
                            </div>
                            <span class="text-green-600 font-semibold">+{{ number_format($revenue['total_amount'], 2) }} €</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500 text-center py-8">Aucun revenu enregistré</p>
            @endif
        </div>
    </div>
</div>
@endsection