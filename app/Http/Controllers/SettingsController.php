<?php

namespace App\Http\Controllers;

use App\Services\AppIdentitySettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SettingsController extends Controller
{
    public function index(AppIdentitySettings $settings): Response
    {
        return Inertia::render('Settings', [
            'settings' => $settings->payload(),
        ]);
    }

    public function update(Request $request, AppIdentitySettings $settings): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'main_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'max:4096'],
        ]);

        $logoPath = null;

        if ($request->hasFile('logo')) {
            if ($settings->logoPath()) {
                Storage::disk('local')->delete($settings->logoPath());
            }

            $logoPath = $request->file('logo')->store('app');
        }

        $settings->update($data['name'], $data['main_color'], $logoPath);

        return back()->with('success', ['key' => 'flash.appSettingsUpdated']);
    }

    public function logo(AppIdentitySettings $settings): BinaryFileResponse
    {
        $path = $settings->logoPath();

        abort_if(! $path, 404);

        $absolutePath = Storage::disk('local')->path($path);

        abort_unless(is_file($absolutePath), 404);

        return response()->file($absolutePath, [
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
