<?php

namespace App\Http\Controllers;

use App\Services\MunkiExternalUrl;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): RedirectResponse
    {
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
}
