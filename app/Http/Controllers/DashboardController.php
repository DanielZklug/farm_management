<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\User;

class DashboardController extends Controller
{
    public function index(Request $request, $userId = null)
    {
        try {
            // Déterminer l'utilisateur cible
            $targetUser = $this->getTargetUser($request, $userId);
            
            if (!$targetUser) {
                return response()->json([
                    'message' => 'Utilisateur non trouvé ou accès non autorisé'
                ], 403);
            }

            // Charger toutes les données nécessaires avec des collections vides par défaut
            $expenses = $targetUser->expenses()->orderBy('date', 'desc')->get() ?? collect();
            $revenues = $targetUser->revenues()->orderBy('date', 'desc')->get() ?? collect();
            $mortality = $targetUser->mortalityEvents()->orderBy('date', 'desc')->get() ?? collect();
            $expenseCategories = $targetUser->expenseCategories()->get() ?? collect();
            $farmData = $targetUser->farmData;

            // Calculer les statistiques avec des valeurs par défaut sécurisées
            $totalRevenue = $revenues->sum('total_amount') ?? 0;
            $totalExpenses = $expenses->sum('amount') ?? 0;
            $totalMortalityLoss = $mortality->sum('estimated_loss') ?? 0;
            $totalMortality = $mortality->sum('count') ?? 0;
            
            $netProfit = $totalRevenue - $totalExpenses - $totalMortalityLoss;
            $reinvestmentAmount = $netProfit > 0 ? $netProfit * 0.7 : 0;
            $mortalityRate = ($farmData && $farmData->total_chickens > 0) 
                ? ($totalMortality / $farmData->total_chickens) * 100 
                : 0;

            // Calculer les finances mensuelles avec vérification des données
            $monthlyFinancials = $this->getMonthlyFinancials($expenses, $revenues);

            return response()->json([
                'user' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'farm_name' => $targetUser->farm_name,
                ],
                'farmData' => [
                    'totalChickens' => $farmData ? $farmData->total_chickens : 0,
                    'expenses' => $expenses,
                    'revenue' => $revenues,
                    'mortality' => $mortality,
                    'expenseCategories' => $expenseCategories,
                ],
                'statistics' => [
                    'totalRevenue' => $totalRevenue,
                    'totalExpenses' => $totalExpenses,
                    'totalMortalityLoss' => $totalMortalityLoss,
                    'netProfit' => $netProfit,
                    'reinvestmentAmount' => $reinvestmentAmount,
                    'mortalityRate' => round($mortalityRate, 2),
                ],
                'monthlyFinancials' => $monthlyFinancials,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du chargement des données',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getTargetUser(Request $request, $userId = null)
    {
        // Si aucun ID n'est fourni, retourner l'utilisateur connecté
        if (!$userId) {
            return $request->user();
        }

        // Vérifier si l'utilisateur connecté est admin
        // $currentUser = $request->user();
        // if (!$currentUser || !$currentUser->is_admin) {
        //     return null;
        // }

        // Récupérer l'utilisateur cible
        return User::find($userId);
    }

    private function getMonthlyFinancials($expenses, $revenues)
    {
        $monthlyData = [];

        // Vérifier et initialiser les collections si null
        $expenses = $expenses ?? collect();
        $revenues = $revenues ?? collect();

        // Traiter les revenus
        foreach ($revenues as $revenue) {
            if (!$revenue->date) continue;
            
            $monthKey = Carbon::parse($revenue->date)->format('Y-m');
            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $monthKey,
                    'totalRevenue' => 0,
                    'totalExpenses' => 0,
                    'netIncome' => 0,
                ];
            }
            $monthlyData[$monthKey]['totalRevenue'] += $revenue->total_amount ?? 0;
        }

        // Traiter les dépenses
        foreach ($expenses as $expense) {
            if (!$expense->date) continue;
            
            $monthKey = Carbon::parse($expense->date)->format('Y-m');
            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $monthKey,
                    'totalRevenue' => 0,
                    'totalExpenses' => 0,
                    'netIncome' => 0,
                ];
            }
            $monthlyData[$monthKey]['totalExpenses'] += $expense->amount ?? 0;
        }

        // Calculer le revenu net
        foreach ($monthlyData as $month => $data) {
            $monthlyData[$month]['netIncome'] = ($data['totalRevenue'] ?? 0) - ($data['totalExpenses'] ?? 0);
        }

        // Trier par mois décroissant et limiter à 12 mois
        krsort($monthlyData);
        return array_values(array_slice($monthlyData, 0, 12));
    }
}