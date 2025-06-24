<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class WebDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Charger toutes les données nécessaires
        $expenses = $user->expenses()->orderBy('date', 'desc')->get();
        $revenues = $user->revenues()->orderBy('date', 'desc')->get();
        $mortality = $user->mortalityEvents()->orderBy('date', 'desc')->get();
        $expenseCategories = $user->expenseCategories()->get();
        $farmData = $user->farmData;

        // Calculer les statistiques
        $totalRevenue = $revenues->sum('total_amount');
        $totalExpenses = $expenses->sum('amount');
        $totalMortalityLoss = $mortality->sum('estimated_loss');
        $totalMortality = $mortality->sum('count');
        
        $netProfit = $totalRevenue - $totalExpenses - $totalMortalityLoss;
        $reinvestmentAmount = $netProfit > 0 ? $netProfit * 0.7 : 0;
        $mortalityRate = $farmData && $farmData->total_chickens > 0 
            ? ($totalMortality / $farmData->total_chickens) * 100 
            : 0;

        // Calculer les finances mensuelles
        $monthlyFinancials = $this->getMonthlyFinancials($expenses, $revenues);

        $farmDataArray = [
            'totalChickens' => $farmData ? $farmData->total_chickens : 0,
            'expenses' => $expenses,
            'revenue' => $revenues,
            'mortality' => $mortality,
            'expenseCategories' => $expenseCategories,
        ];

        $statistics = [
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'totalMortalityLoss' => $totalMortalityLoss,
            'netProfit' => $netProfit,
            'reinvestmentAmount' => $reinvestmentAmount,
            'mortalityRate' => $mortalityRate,
        ];

        return view('dashboard', compact('farmDataArray', 'statistics', 'monthlyFinancials'))
            ->with('farmData', $farmDataArray);
    }

    private function getMonthlyFinancials($expenses, $revenues)
    {
        $monthlyData = [];

        // Traiter les revenus
        foreach ($revenues as $revenue) {
            $monthKey = $revenue->date->format('Y-m');
            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $monthKey,
                    'totalRevenue' => 0,
                    'totalExpenses' => 0,
                    'netIncome' => 0,
                ];
            }
            $monthlyData[$monthKey]['totalRevenue'] += $revenue->total_amount;
        }

        // Traiter les dépenses
        foreach ($expenses as $expense) {
            $monthKey = $expense->date->format('Y-m');
            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $monthKey,
                    'totalRevenue' => 0,
                    'totalExpenses' => 0,
                    'netIncome' => 0,
                ];
            }
            $monthlyData[$monthKey]['totalExpenses'] += $expense->amount;
        }

        // Calculer le revenu net
        foreach ($monthlyData as $month => $data) {
            $monthlyData[$month]['netIncome'] = $data['totalRevenue'] - $data['totalExpenses'];
        }

        // Trier par mois décroissant et limiter à 6 mois
        krsort($monthlyData);
        return array_slice($monthlyData, 0, 6);
    }
}