<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function show(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Login');
    }

    public function login(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return back()->withErrors([
                'email' => 'Invalid administrator credentials.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();
        $request->user()?->forceFill(['last_login_at' => now()])->save();

        return redirect()->route('dashboard');
    }

    public function logout(Request $request): \Illuminate\Http\RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function ownerExists(): bool
    {
        return User::query()
            ->where('is_owner', true)
            ->orWhere('role', User::ROLE_OWNER)
            ->exists();
    }
}
