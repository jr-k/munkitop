<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    public const ACTION_INSTALL = 'install';

    public const ACTION_UNINSTALL = 'uninstall';

    protected $fillable = [
        'package_id',
        'assignable_type',
        'assignable_id',
        'action',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }
}
