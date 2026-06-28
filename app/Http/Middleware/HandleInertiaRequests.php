<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'admin' => (bool) $request->session()->get('admin_authenticated', false)
                    ? ['email' => config('munki.admin_email')]
                    : null,
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
