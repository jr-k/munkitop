<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('permissions');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_owner' => $user->is_owner,
                ] : null,
                'permissions' => $user?->permissionKeys() ?? [],
                'isAdmin' => (bool) $user?->isAdministrator(),
                'isOwner' => (bool) $user?->is_owner,
            ],
            'app' => [
                'display_name' => config('app.display_name'),
                'version' => config('app.version'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
