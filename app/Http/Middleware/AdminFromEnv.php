<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminFromEnv
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! (bool) $request->session()->get('admin_authenticated', false)) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
