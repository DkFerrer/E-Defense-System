<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DefenseScheduleController;

Route::get('/ping', function () {
    return response()->json([
        'app' => 'Scheduling API',
        'message' => 'Laravel backend is running.',
        'time' => now()->toIso8601String(),
    ]);
});

Route::apiResource('schedules', DefenseScheduleController::class);
