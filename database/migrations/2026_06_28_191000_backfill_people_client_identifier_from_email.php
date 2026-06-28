<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('people')
            ->select(['id', 'email'])
            ->orderBy('id')
            ->each(function (object $person): void {
                DB::table('people')
                    ->where('id', $person->id)
                    ->update([
                        'client_identifier' => $person->email,
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
