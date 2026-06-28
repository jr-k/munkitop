<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MobileconfigShare extends Model
{
    protected $fillable = [
        'ulid',
        'target_type',
        'target_id',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }
}
