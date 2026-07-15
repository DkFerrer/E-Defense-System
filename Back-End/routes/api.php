<?php

use App\Http\Controllers\AdviserRequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes are automatically prefixed with /api by Laravel.
|
*/

// ─── Public Auth Routes ──────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// ─── Protected Routes (Sanctum) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });

    // Adviser Acceptance Requests
    Route::prefix('adviser-requests')->group(function () {
        Route::get('/', [AdviserRequestController::class, 'index']);
        Route::post('/', [AdviserRequestController::class, 'store']);
        Route::get('/{id}', [AdviserRequestController::class, 'show']);
        Route::patch('/{id}/status', [AdviserRequestController::class, 'updateStatus']);
        Route::patch('/{id}/reset', [AdviserRequestController::class, 'resetStatus']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/recent-requests', [DashboardController::class, 'recentRequests']);
    });

    // List available advisers for student picker
    Route::get('/advisers', function () {
        $advisers = \App\Models\User::whereIn('role', ['adviser', 'dean'])
            ->where('is_active', true)
            ->select('id', 'first_name', 'last_name', 'email', 'department', 'role', 'college')
            ->orderBy('last_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $advisers,
        ]);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    });
});
