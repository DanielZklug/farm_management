<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminPanelController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\MortalityController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\FarmDataController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Panel
    Route::post('/users', [AdminPanelController::class, 'addUser']);
    Route::post('/import-csv/{selectedUserId}', [AdminPanelController::class, 'importCsv']);
    Route::get('/users', [AdminPanelController::class, 'getAllUsers']);
    Route::put('/users/{user}', [AdminPanelController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminPanelController::class, 'deleteUser']);
    Route::patch('/users/status/{user}', [AdminPanelController::class, 'toggleUserStatus']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/export-csv/{userId}', [DashboardController::class, 'index']);
    
    // Dépenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
    
    // Revenus
    Route::get('/revenues', [RevenueController::class, 'index']);
    Route::post('/revenues', [RevenueController::class, 'store']);
    Route::delete('/revenues/{revenue}', [RevenueController::class, 'destroy']);
    Route::put('/revenues/{revenue}', [RevenueController::class, 'update']);
    
    // Mortalité
    Route::get('/mortality', [MortalityController::class, 'index']);
    Route::post('/mortality', [MortalityController::class, 'store']);
    Route::delete('/mortality/{mortality}', [MortalityController::class, 'destroy']);
    Route::put('/mortality/{mortality}', [MortalityController::class, 'update']);
    
    // Catégories de dépenses
    Route::get('/expense-categories', [ExpenseCategoryController::class, 'index']);
    Route::post('/expense-categories', [ExpenseCategoryController::class, 'store']);
    Route::delete('/expense-categories/{category}', [ExpenseCategoryController::class, 'destroy']);
    
    // Données de ferme
    Route::put('/farm-data/chickens', [FarmDataController::class, 'updateTotalChickens']);
});