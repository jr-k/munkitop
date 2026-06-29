<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserPermission
{
    public function handle(Request $request, Closure $next, string $resource, ?string $action = null): Response
    {
        abort_unless($request->user()?->hasPermission($resource, $action), 403);

        return $next($request);
    }
}
