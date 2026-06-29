<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        return $next($request);
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
