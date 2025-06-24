<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = $request->user()->expenses()->orderBy('date', 'desc')->get();
        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:ponctuel,quotidien,hebdomadaire,mensuel,trimestriel,annuel',
        ]);

        $isRecurring = $request->frequency !== 'ponctuel';
        $nextDueDate = null;

        if ($isRecurring) {
            $nextDueDate = $this->calculateNextDueDate($request->date, $request->frequency);
        }

        $expense = $request->user()->expenses()->create([
            'date' => $request->date,
            'category' => $request->category,
            'description' => $request->description,
            'amount' => $request->amount,
            'frequency' => $request->frequency,
            'is_recurring' => $isRecurring,
            'next_due_date' => $nextDueDate,
        ]);

        return response()->json($expense, 201);
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $expense->delete();
        return response()->json(['message' => 'Dépense supprimée']);
    }

    private function calculateNextDueDate($date, $frequency)
    {
        $currentDate = Carbon::parse($date);
        
        switch ($frequency) {
            case 'quotidien':
                return $currentDate->addDay()->format('Y-m-d');
            case 'hebdomadaire':
                return $currentDate->addWeek()->format('Y-m-d');
            case 'mensuel':
                return $currentDate->addMonth()->format('Y-m-d');
            case 'trimestriel':
                return $currentDate->addMonths(3)->format('Y-m-d');
            case 'annuel':
                return $currentDate->addYear()->format('Y-m-d');
            default:
                return null;
        }
    }
     public function update(Request $request, Expense $expense)
    {
        // Vérification que la dépense appartient à l'utilisateur
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'date' => 'sometimes|date',
            'category' => 'sometimes|string',
            'description' => 'sometimes|string',
            'amount' => 'sometimes|numeric|min:0',
            'frequency' => 'sometimes|in:ponctuel,quotidien,hebdomadaire,mensuel,trimestriel,annuel',
        ]);

        // Calcul du nouveau next_due_date si la fréquence ou la date change
        $isRecurring = $request->has('frequency') 
            ? $request->frequency !== 'ponctuel'
            : $expense->frequency !== 'ponctuel';

        $nextDueDate = null;
        
        if ($isRecurring) {
            $date = $request->has('date') ? $request->date : $expense->date;
            $frequency = $request->has('frequency') ? $request->frequency : $expense->frequency;
            $nextDueDate = $this->calculateNextDueDate($date, $frequency);
        }

        // Mise à jour des champs
        $expense->update([
            'date' => $request->input('date', $expense->date),
            'category' => $request->input('category', $expense->category),
            'description' => $request->input('description', $expense->description),
            'amount' => $request->input('amount', $expense->amount),
            'frequency' => $request->input('frequency', $expense->frequency),
            'is_recurring' => $isRecurring,
            'next_due_date' => $nextDueDate,
        ]);

        return response()->json($expense);
    }
}