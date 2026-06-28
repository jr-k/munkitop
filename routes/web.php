<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MunkiExportController;
use App\Http\Controllers\MobileconfigShareController;
use App\Http\Controllers\MunkiProfileController;
use App\Http\Controllers\MunkiRepoController;
use App\Http\Controllers\MunkiSettingsController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageFileController;
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
Route::get('/m/{share}', [MunkiProfileController::class, 'shared'])->name('mobileconfig.shared');
Route::get('/m/{share}/download', [MunkiProfileController::class, 'downloadShared'])->name('mobileconfig.shared.download');

Route::middleware('admin')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::delete('/people/bulk', [PersonController::class, 'bulkDestroy'])->name('people.bulk-destroy');
    Route::delete('/groups/bulk', [GroupController::class, 'bulkDestroy'])->name('groups.bulk-destroy');
    Route::delete('/packages/bulk', [PackageController::class, 'bulkDestroy'])->name('packages.bulk-destroy');
    Route::resource('people', PersonController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('groups', GroupController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('packages', PackageController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/packages/{package}/file', PackageFileController::class)->name('packages.file');
    Route::get('/packages/{package}/icon', PackageIconController::class)->name('packages.icon');

    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::delete('/assignments/bulk', [AssignmentController::class, 'bulkDestroy'])->name('assignments.bulk-destroy');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');

    Route::get('/links', [MobileconfigShareController::class, 'index'])->name('links.index');
    Route::delete('/links/bulk', [MobileconfigShareController::class, 'bulkDestroy'])->name('links.bulk-destroy');
    Route::put('/links/{share}', [MobileconfigShareController::class, 'update'])->name('links.update');
    Route::delete('/links/{share}', [MobileconfigShareController::class, 'destroy'])->name('links.destroy');

    Route::get('/munki', [DashboardController::class, 'munki'])->name('munki.index');
    Route::put('/munki/settings', [MunkiSettingsController::class, 'update'])->name('munki.settings.update');
    Route::get('/munki/groups/{group}/mobileconfig', [MunkiProfileController::class, 'group'])->name('munki.groups.mobileconfig');
    Route::get('/munki/groups/{group}/mobileconfig/preview', [MunkiProfileController::class, 'groupPreview'])->name('munki.groups.mobileconfig.preview');
    Route::post('/munki/groups/{group}/mobileconfig/share', [MunkiProfileController::class, 'shareGroup'])->name('munki.groups.mobileconfig.share');
    Route::get('/munki/people/{person}/mobileconfig', [MunkiProfileController::class, 'person'])->name('munki.people.mobileconfig');
    Route::get('/munki/people/{person}/mobileconfig/preview', [MunkiProfileController::class, 'personPreview'])->name('munki.people.mobileconfig.preview');
    Route::post('/munki/people/{person}/mobileconfig/share', [MunkiProfileController::class, 'sharePerson'])->name('munki.people.mobileconfig.share');
    Route::post('/munki/export', MunkiExportController::class)->name('munki.export');
});
