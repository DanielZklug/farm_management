<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = $request->user()->expenseCategories()->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string',
        ]);

        $category = $request->user()->expenseCategories()->create([
            'name' => $request->name,
            'color' => $request->color,
            'is_default' => false,
        ]);

        return response()->json($category, 201);
    }

    public function destroy(Request $request, ExpenseCategory $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($category->is_default) {
            return response()->json(['message' => 'Impossible de supprimer une catégorie par défaut'], 400);
        }

        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }
}