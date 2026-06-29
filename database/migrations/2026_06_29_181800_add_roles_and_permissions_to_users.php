<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default(User::ROLE_USER)->after('password');
            $table->boolean('is_owner')->default(false)->after('role');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });

        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('resource');
            $table->string('action');
            $table->timestamps();

            $table->unique(['user_id', 'resource', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_owner', 'last_login_at']);
        });
    }
};
