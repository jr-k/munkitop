<?php

namespace App\Http\Controllers;

use App\Services\MunkiExternalUrl;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MunkiSettingsController extends Controller
{
    public function update(Request $request, MunkiExternalUrl $externalUrl): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'override' => ['required', 'boolean'],
            'url' => ['nullable', Rule::requiredIf($request->boolean('override')), 'url', 'max:2048'],
        ]);

        $externalUrl->update((bool) $data['override'], $data['url'] ?? null);

        return back()->with('success', ['key' => 'flash.munkiSettingsUpdated']);
    }
}
