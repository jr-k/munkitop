<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('users:bootstrap-owner', function (): int {
    if (User::query()->where('is_owner', true)->orWhere('role', User::ROLE_OWNER)->exists()) {
        $this->info('Owner bootstrap skipped: an owner already exists.');

        return Command::SUCCESS;
    }

    $email = (string) config('munki.admin_email');
    $password = (string) config('munki.admin_password');

    if ($email === '' || $password === '') {
        $this->error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create the first owner.');

        return Command::FAILURE;
    }

    $user = User::query()->where('email', $email)->first();

    if ($user) {
        $user->forceFill([
            'name' => $user->name ?: 'Owner',
            'password' => $password,
            'role' => User::ROLE_OWNER,
            'is_owner' => true,
        ])->save();

        $this->info("Existing user {$email} promoted to owner.");

        return Command::SUCCESS;
    }

    User::create([
        'name' => 'Owner',
        'email' => $email,
        'password' => $password,
        'role' => User::ROLE_OWNER,
        'is_owner' => true,
    ]);

    $this->info("Owner created for {$email}.");

    return Command::SUCCESS;
})->purpose('Create the first owner when no users exist');

Artisan::command('users:flush {--force : Run without confirmation}', function (): int {
    if (! $this->option('force') && ! $this->confirm('Delete all users, permissions, password reset tokens, and sessions?')) {
        $this->info('User flush cancelled.');

        return Command::SUCCESS;
    }

    DB::transaction(function (): void {
        if (Schema::hasTable('user_permissions')) {
            DB::table('user_permissions')->delete();
        }

        if (Schema::hasTable('password_reset_tokens')) {
            DB::table('password_reset_tokens')->delete();
        }

        if (Schema::hasTable('sessions')) {
            DB::table('sessions')->delete();
        }

        if (Schema::hasTable('users')) {
            User::query()->delete();
        }
    });

    $this->info('Users flushed. Run users:bootstrap-owner to create the first owner again.');

    return Command::SUCCESS;
})->purpose('Delete all users and auth state before first-time owner bootstrap');
