<?php

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::apiResource('users', UserController::class);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('attendance', AttendanceController::class)->only(['index', 'store']);
    Route::get('employees/{id}/attendance', [AttendanceController::class, 'getByEmployee']);

    Route::group(['prefix' => 'products'], function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::post('/', [ProductController::class, 'store']);
        Route::get('/{id}', [ProductController::class, 'show']);
        Route::patch('/{id}', [ProductController::class, 'update']);
        Route::delete('/{id}', [ProductController::class, 'destroy']);
        Route::patch('/{id}/stock', [ProductController::class, 'updateStock']);
    });

    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('enquiries', EnquiryController::class);
    Route::apiResource('orders', OrderController::class);
    Route::patch('orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'destroy']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    
    Route::apiResource('expenses', ExpenseController::class);
    
    Route::group(['prefix' => 'transactions'], function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::post('/', [TransactionController::class, 'store']);
        Route::get('/{id}', [TransactionController::class, 'show']);
    });
});
