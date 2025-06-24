<?php

namespace App\Http\Controllers;

use App\Models\MortalityEvent;
use Illuminate\Http\Request;

class MortalityController extends Controller
{
    public function index(Request $request)
    {
        $mortality = $request->user()->mortalityEvents()->orderBy('date', 'desc')->get();
        return response()->json($mortality);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'cause' => 'required|in:maladie,predateur,accident,naturel,inconnu',
            'count' => 'required|integer|min:1',
            'description' => 'required|string',
            'estimated_loss' => 'required|numeric|min:0',
        ]);

        $mortality = $request->user()->mortalityEvents()->create($request->all());

        return response()->json($mortality, 201);
    }
    public function update(Request $request, MortalityEvent $mortality)
    {
        // Vérification que l'événement appartient à l'utilisateur
        if ($mortality->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'date' => 'sometimes|date',
            'cause' => 'sometimes|in:maladie,predateur,accident,naturel,inconnu',
            'count' => 'sometimes|integer|min:1',
            'description' => 'sometimes|string',
            'estimated_loss' => 'sometimes|numeric|min:0',
        ]);

        // Mise à jour des champs
        $mortality->update([
            'date' => $request->input('date', $mortality->date),
            'cause' => $request->input('cause', $mortality->cause),
            'count' => $request->input('count', $mortality->count),
            'description' => $request->input('description', $mortality->description),
            'estimated_loss' => $request->input('estimated_loss', $mortality->estimated_loss),
        ]);

        return response()->json($mortality);
    }


    public function destroy(Request $request, MortalityEvent $mortality)
    {
        if ($mortality->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $mortality->delete();
        return response()->json(['message' => 'Événement de mortalité supprimé']);
    }
}