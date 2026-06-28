<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\MobileconfigShare;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MobileconfigShareController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Shares', [
            'shares' => MobileconfigShare::query()
                ->with('target')
                ->latest()
                ->get()
                ->map(fn (MobileconfigShare $share) => [
                    'id' => $share->id,
                    'ulid' => $share->ulid,
                    'url' => url('/m/'.$share->ulid),
                    'target' => $this->target($share),
                    'expires_at' => $share->expires_at?->toIso8601String(),
                    'expired' => (bool) $share->expires_at?->isPast(),
                    'created_at' => $share->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function update(Request $request, MobileconfigShare $share): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'expires_in' => ['required', Rule::in(['keep', 'never', '1d', '7d', '30d'])],
        ]);

        if ($data['expires_in'] !== 'keep') {
            $share->update([
                'expires_at' => $this->expiresAt($data['expires_in']),
            ]);
        }

        return back()->with('success', ['key' => 'flash.shareUpdated']);
    }

    public function destroy(MobileconfigShare $share): \Illuminate\Http\RedirectResponse
    {
        $share->delete();

        return back()->with('success', ['key' => 'flash.shareDeleted']);
    }

    public function bulkDestroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:mobileconfig_shares,id'],
        ]);

        MobileconfigShare::query()->whereKey($data['ids'])->delete();

        return back()->with('success', ['key' => 'flash.linksDeleted']);
    }

    private function target(MobileconfigShare $share): array
    {
        $target = $share->target;

        if ($target instanceof Person) {
            return [
                'type' => 'person',
                'name' => trim("{$target->first_name} {$target->name}"),
                'identifier' => $target->client_identifier,
            ];
        }

        if ($target instanceof Group) {
            return [
                'type' => 'group',
                'name' => $target->name,
                'identifier' => $target->slug,
            ];
        }

        return [
            'type' => 'missing',
            'name' => null,
            'identifier' => null,
        ];
    }

    private function expiresAt(string $expiresIn): ?\Illuminate\Support\Carbon
    {
        return match ($expiresIn) {
            '1d' => now()->addDay(),
            '7d' => now()->addDays(7),
            '30d' => now()->addDays(30),
            default => null,
        };
    }
}
