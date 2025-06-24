<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebAuthController;
use App\Http\Controllers\WebDashboardController;

Route::get('/', function () {
    return view('welcome');
});
// Route::get('/login', [WebAuthController::class, 'showLoginForm'])->name('login');
// Route::post('/login', [WebAuthController::class, 'login']);
// Route::get('/register', [WebAuthController::class, 'showRegisterForm'])->name('register');
// Route::post('/register', [WebAuthController::class, 'register']);

// Routes protégées
// Route::middleware('auth')->group(function () {
//     Route::post('/logout', [WebAuthController::class, 'logout'])->name('logout');
//     Route::get('/dashboard', [WebDashboardController::class, 'index'])->name('dashboard');
    
//     // Placeholder routes pour les autres sections
//     Route::get('/expenses', function () {
//         return view('expenses.index');
//     })->name('expenses.index');
    
//     Route::get('/revenues', function () {
//         return view('revenues.index');
//     })->name('revenues.index');
    
//     Route::get('/mortality', function () {
//         return view('mortality.index');
//     })->name('mortality.index');
// });