<?php

use App\Models\Group;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('notes');
        });

        $now = now();
        DB::table('groups')->updateOrInsert(
            ['slug' => Group::DEFAULT_SLUG],
            [
                'name' => 'Default',
                'notes' => 'Groupe système inclus automatiquement pour tous les people.',
                'is_system' => true,
                'updated_at' => $now,
                'created_at' => $now,
            ],
        );

        $defaultGroupId = DB::table('groups')
            ->where('slug', Group::DEFAULT_SLUG)
            ->value('id');

        $memberships = DB::table('people')
            ->select('id')
            ->get()
            ->map(fn (object $person) => [
                'group_id' => $defaultGroupId,
                'person_id' => $person->id,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        if ($memberships !== []) {
            DB::table('group_person')->insertOrIgnore($memberships);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $defaultGroupId = DB::table('groups')
            ->where('slug', Group::DEFAULT_SLUG)
            ->value('id');

        if ($defaultGroupId) {
            DB::table('group_person')->where('group_id', $defaultGroupId)->delete();
            DB::table('groups')->where('id', $defaultGroupId)->delete();
        }

        Schema::table('groups', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};
