<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
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

    public function forgotPasswordForm(): Response|\Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        return Inertia::render('ForgotPassword');
    }

    public function sendPasswordResetLink(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            return back()->withErrors(['email' => __($status)])->onlyInput('email');
        }

        return back()
            ->with('success', ['key' => 'flash.passwordResetLinkSent'])
            ->onlyInput('email');
    }

    public function resetPasswordForm(Request $request, string $token): Response|\Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        return Inertia::render('ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! $this->ownerExists()) {
            return redirect()->route('onboarding');
        }

        $credentials = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $credentials,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            },
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', ['key' => 'flash.passwordResetDone'])
            : back()->withErrors(['email' => __($status)])->onlyInput('email');
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
