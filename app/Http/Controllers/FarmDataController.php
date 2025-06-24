<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FarmDataController extends Controller
{
    public function updateTotalChickens(Request $request)
    {
        $request->validate([
            'total_chickens' => 'required|integer|min:0',
        ]);

        $farmData = $request->user()->farmData;
        
        if (!$farmData) {
            $farmData = $request->user()->farmData()->create([
                'total_chickens' => $request->total_chickens,
            ]);
        } else {
            $farmData->update([
                'total_chickens' => $request->total_chickens,
            ]);
        }

        return response()->json($farmData);
    }
}