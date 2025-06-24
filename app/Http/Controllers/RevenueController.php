<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function index(Request $request)
    {
        $revenues = $request->user()->revenues()->orderBy('date', 'desc')->get();
        return response()->json($revenues);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:oeufs,poulets,fonds-externes,subventions,aides-agricoles,autre',
            'description' => 'required|string',
            'quantity' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $totalAmount = $request->quantity * $request->unit_price;

        $revenue = $request->user()->revenues()->create([
            'date' => $request->date,
            'type' => $request->type,
            'description' => $request->description,
            'quantity' => $request->quantity,
            'unit_price' => $request->unit_price,
            'total_amount' => $totalAmount,
        ]);

        return response()->json($revenue, 201);
    }

    public function destroy(Request $request, Revenue $revenue)
    {
        if ($revenue->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $revenue->delete();
        return response()->json(['message' => 'Revenu supprimé']);
    }
    public function update(Request $request, Revenue $revenue)
    {
        // Vérification que le revenu appartient à l'utilisateur
        if ($revenue->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:oeufs,poulets,fonds-externes,subventions,aides-agricoles,autre',
            'description' => 'sometimes|string',
            'quantity' => 'sometimes|numeric|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
        ]);

        // Calcul du nouveau montant total si quantité ou prix unitaire change
        $quantity = $request->has('quantity') ? $request->quantity : $revenue->quantity;
        $unitPrice = $request->has('unit_price') ? $request->unit_price : $revenue->unit_price;
        $totalAmount = $quantity * $unitPrice;

        // Mise à jour des champs
        $revenue->update([
            'date' => $request->input('date', $revenue->date),
            'type' => $request->input('type', $revenue->type),
            'description' => $request->input('description', $revenue->description),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_amount' => $totalAmount,
        ]);

        return response()->json($revenue);
    }

}