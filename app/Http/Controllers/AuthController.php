<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function show(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if ((bool) $request->session()->get('admin_authenticated', false)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Login');
    }

    public function login(Request $request): \Illuminate\Http\RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $validEmail = hash_equals((string) config('munki.admin_email'), $credentials['email']);
        $validPassword = hash_equals((string) config('munki.admin_password'), $credentials['password']);

        if (! $validEmail || ! $validPassword) {
            return back()->withErrors([
                'email' => 'Invalid administrator credentials.',
            ]);
        }

        $request->session()->regenerate();
        $request->session()->put('admin_authenticated', true);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->session()->forget('admin_authenticated');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
