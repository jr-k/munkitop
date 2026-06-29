<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MunkiExternalUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        return redirect()->route('people.index');
    }

    public function munki(MunkiExternalUrl $externalUrl): Response
    {
        return Inertia::render('Munki', [
            'munki' => [
                'repoPath' => config('munki.repo_path'),
                'repoUrl' => $externalUrl->repoUrl(),
                'externalUrl' => $externalUrl->settings(),
                'catalog' => config('munki.default_catalog'),
                'baseManifest' => config('munki.base_manifest'),
            ],
        ]);
    }

    private function ownerExists(): bool
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'role') || ! Schema::hasColumn('users', 'is_owner')) {
            return false;
        }

        return User::query()
            ->where('is_owner', true)
            ->orWhere('role', User::ROLE_OWNER)
            ->exists();
    }
}
