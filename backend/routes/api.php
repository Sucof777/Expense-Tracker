<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StatsController;

/**
 * AUTH rute: moraju kroz 'web' middleware jer koristiš session cookies (Auth::attempt + sesija).
 * Ove rute nisu zaštićene; služe da registruješ/login/logout.
 */
Route::middleware('web')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

/**
 * Debug ruta (opciono) – da vidiš da li je user autentifikovan i koja je session ID.
 */
Route::middleware('web')->get('/auth/debug', function (\Illuminate\Http\Request $r) {
    return response()->json([
        'auth_check' => auth()->check(),
        'user_id' => optional(auth()->user())->id,
        'session_id' => $r->session()->getId(),
    ]);
});

/**
 * ZAŠTIĆENE rute: 'web' (da povuče cookies/sesiju) + 'auth' (session guard).
 * Ovo je najjednostavnije i najstabilnije za SPA sa cookie-sesijama.
 */
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('/stats/summary', [StatsController::class, 'summary']);
});

/**
 * Fallback za neautentifikovane zahtjeve kada 'auth' pokuša redirect na named route 'login'.
 * Umjesto 500 (“Route [login] not defined.”) dobićeš čist 401 JSON.
 */
Route::get('/login', fn() => response()->json(['message' => 'Unauthenticated.'], 401))
    ->name('login');

/** Test */
Route::get('/ping', fn() => response()->json(['ok' => true]));
