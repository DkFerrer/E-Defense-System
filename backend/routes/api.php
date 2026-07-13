<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationPanelController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\RubricController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/rubrics', [RubricController::class, 'index']);
    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::put('/evaluations/{evaluation}', [EvaluationController::class, 'update']);
    Route::get('/evaluations/{evaluation}/rubric-bundle', [EvaluationPanelController::class, 'rubricBundle']);
    Route::put('/evaluations/{evaluation}/submission', [EvaluationPanelController::class, 'upsertSubmission']);
    Route::get('/results', [ResultController::class, 'index']);
    Route::get('/evaluations/results', [EvaluationPanelController::class, 'results']);
    Route::get('/evaluations/my-submissions', [EvaluationPanelController::class, 'mySubmissions']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
});

Route::any('{path}', function ($path) {
    $script = base_path('php_api/' . $path);
    if (file_exists($script)) {
        chdir(base_path('php_api'));
        require $script;
        exit;
    }
    abort(404);
})->where('path', '.*\.php$');

