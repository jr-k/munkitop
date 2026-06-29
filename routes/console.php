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

    $this->info('Users flushed. Open /onboarding to create the first owner again.');

    return Command::SUCCESS;
})->purpose('Delete all users and auth state before first-time onboarding');
