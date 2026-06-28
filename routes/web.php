<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MunkiExportController;
use App\Http\Controllers\MunkiProfileController;
use App\Http\Controllers\MunkiRepoController;
use App\Http\Controllers\MunkiSettingsController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageIconController;
use App\Http\Controllers\PersonController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/repo', [MunkiRepoController::class, 'index'])->name('repo.index');
Route::get('/repo/{path}', [MunkiRepoController::class, 'show'])
    ->where('path', '.*')
    ->name('repo.show');

Route::middleware('admin')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::resource('people', PersonController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('groups', GroupController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('packages', PackageController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/packages/{package}/icon', PackageIconController::class)->name('packages.icon');

    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');

    Route::get('/munki', [DashboardController::class, 'munki'])->name('munki.index');
    Route::put('/munki/settings', [MunkiSettingsController::class, 'update'])->name('munki.settings.update');
    Route::get('/munki/groups/{group}/mobileconfig', [MunkiProfileController::class, 'group'])->name('munki.groups.mobileconfig');
    Route::get('/munki/people/{person}/mobileconfig', [MunkiProfileController::class, 'person'])->name('munki.people.mobileconfig');
    Route::post('/munki/export', MunkiExportController::class)->name('munki.export');
});
