<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(): Response|\Illuminate\Http\RedirectResponse
    {
        if ($this->ownerExists()) {
            return Auth::check()
                ? redirect()->route('dashboard')
                : redirect()->route('login');
        }

        return Inertia::render('Onboarding');
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        if ($this->ownerExists()) {
            return Auth::check()
                ? redirect()->route('dashboard')
                : redirect()->route('login');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data): User {
            abort_if($this->ownerExists(), 409);

            return User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => User::ROLE_OWNER,
                'is_owner' => true,
            ]);
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    private function ownerExists(): bool
    {
        return User::query()
            ->where('is_owner', true)
            ->orWhere('role', User::ROLE_OWNER)
            ->exists();
    }
}
