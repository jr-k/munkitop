<?php

use App\Models\User;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\EnsureOnboardingIsComplete;
use App\Http\Middleware\EnsureUserPermission;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Support\Facades\Schema;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'onboarded' => EnsureOnboardingIsComplete::class,
            'permission' => EnsureUserPermission::class,
        ]);
        $middleware->prependToPriorityList(Authenticate::class, EnsureOnboardingIsComplete::class);

        $middleware->redirectGuestsTo(function (Request $request): string {
            if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'role') || ! Schema::hasColumn('users', 'is_owner')) {
                return route('onboarding');
            }

            $ownerExists = User::query()
                ->where('is_owner', true)
                ->orWhere('role', User::ROLE_OWNER)
                ->exists();

            return $ownerExists ? route('login') : route('onboarding');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
