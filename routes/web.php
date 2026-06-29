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
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::get('/repo', [MunkiRepoController::class, 'index'])->name('repo.index');
Route::get('/repo/{path}', [MunkiRepoController::class, 'show'])
    ->where('path', '.*')
    ->name('repo.show');
Route::get('/m/{share}', [MunkiProfileController::class, 'shared'])->name('mobileconfig.shared');
Route::get('/m/{share}/download', [MunkiProfileController::class, 'downloadShared'])->name('mobileconfig.shared.download');
Route::get('/scripts/set-munki-check-interval.sh', fn () => response()->download(
    base_path('scripts/set-munki-check-interval.sh'),
    'set-munki-check-interval.sh',
    ['Content-Type' => 'text/x-shellscript'],
))->name('scripts.set-munki-check-interval');

Route::middleware(['onboarded', 'auth'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::delete('/people/bulk', [PersonController::class, 'bulkDestroy'])->middleware('permission:people,update')->name('people.bulk-destroy');
    Route::delete('/groups/bulk', [GroupController::class, 'bulkDestroy'])->middleware('permission:groups,update')->name('groups.bulk-destroy');
    Route::delete('/packages/bulk', [PackageController::class, 'bulkDestroy'])->middleware('permission:packages,update')->name('packages.bulk-destroy');
    Route::get('/people/csv', [PersonController::class, 'csv'])->middleware('permission:export')->name('people.csv');
    Route::get('/groups/csv', [GroupController::class, 'csv'])->middleware('permission:export')->name('groups.csv');
    Route::get('/packages/csv', [PackageController::class, 'csv'])->middleware('permission:export')->name('packages.csv');
    Route::get('/assignments/csv', [AssignmentController::class, 'csv'])->middleware('permission:export')->name('assignments.csv');
    Route::get('/people', [PersonController::class, 'index'])->middleware('permission:people,read')->name('people.index');
    Route::post('/people', [PersonController::class, 'store'])->middleware('permission:people,update')->name('people.store');
    Route::put('/people/{person}', [PersonController::class, 'update'])->middleware('permission:people,update')->name('people.update');
    Route::delete('/people/{person}', [PersonController::class, 'destroy'])->middleware('permission:people,update')->name('people.destroy');
    Route::get('/groups', [GroupController::class, 'index'])->middleware('permission:groups,read')->name('groups.index');
    Route::post('/groups', [GroupController::class, 'store'])->middleware('permission:groups,update')->name('groups.store');
    Route::put('/groups/{group}', [GroupController::class, 'update'])->middleware('permission:groups,update')->name('groups.update');
    Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->middleware('permission:groups,update')->name('groups.destroy');
    Route::get('/packages', [PackageController::class, 'index'])->middleware('permission:packages,read')->name('packages.index');
    Route::post('/packages', [PackageController::class, 'store'])->middleware('permission:packages,update')->name('packages.store');
    Route::put('/packages/{package}', [PackageController::class, 'update'])->middleware('permission:packages,update')->name('packages.update');
    Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->middleware('permission:packages,update')->name('packages.destroy');
    Route::get('/packages/{package:public_id}/file', PackageFileController::class)->middleware('permission:packages,read')->name('packages.file');
    Route::get('/packages/{package:public_id}/icon', PackageIconController::class)->middleware('permission:packages,read')->name('packages.icon');

    Route::get('/assignments', [AssignmentController::class, 'index'])->middleware('permission:assignments,read')->name('assignments.index');
    Route::post('/assignments', [AssignmentController::class, 'store'])->middleware('permission:assignments,update')->name('assignments.store');
    Route::delete('/assignments/bulk', [AssignmentController::class, 'bulkDestroy'])->middleware('permission:assignments,update')->name('assignments.bulk-destroy');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->middleware('permission:assignments,update')->name('assignments.destroy');

    Route::get('/links', [MobileconfigShareController::class, 'index'])->middleware('permission:links,read')->name('links.index');
    Route::delete('/links/bulk', [MobileconfigShareController::class, 'bulkDestroy'])->middleware('permission:links,update')->name('links.bulk-destroy');
    Route::post('/links/{share}/email', [MobileconfigShareController::class, 'email'])->middleware('permission:links,update')->name('links.email');
    Route::put('/links/{share}', [MobileconfigShareController::class, 'update'])->middleware('permission:links,update')->name('links.update');
    Route::delete('/links/{share}', [MobileconfigShareController::class, 'destroy'])->middleware('permission:links,update')->name('links.destroy');

    Route::get('/munki', [DashboardController::class, 'munki'])->middleware('permission:export')->name('munki.index');
    Route::put('/munki/settings', [MunkiSettingsController::class, 'update'])->middleware('permission:export')->name('munki.settings.update');
    Route::get('/munki/groups/{group}/mobileconfig', [MunkiProfileController::class, 'group'])->middleware('permission:export')->name('munki.groups.mobileconfig');
    Route::get('/munki/groups/{group}/mobileconfig/preview', [MunkiProfileController::class, 'groupPreview'])->middleware('permission:export')->name('munki.groups.mobileconfig.preview');
    Route::post('/munki/groups/{group}/mobileconfig/share', [MunkiProfileController::class, 'shareGroup'])->middleware('permission:links,update')->name('munki.groups.mobileconfig.share');
    Route::get('/munki/people/{person}/mobileconfig', [MunkiProfileController::class, 'person'])->middleware('permission:export')->name('munki.people.mobileconfig');
    Route::get('/munki/people/{person}/mobileconfig/preview', [MunkiProfileController::class, 'personPreview'])->middleware('permission:export')->name('munki.people.mobileconfig.preview');
    Route::post('/munki/people/{person}/mobileconfig/share', [MunkiProfileController::class, 'sharePerson'])->middleware('permission:links,update')->name('munki.people.mobileconfig.share');
    Route::post('/munki/export', MunkiExportController::class)->middleware('permission:export')->name('munki.export');
});
