<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    public const DEFAULT_SLUG = 'default';

    protected $fillable = [
        'name',
        'slug',
        'notes',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function people(): BelongsToMany
    {
        return $this->belongsToMany(Person::class)->withTimestamps();
    }

    public function assignments(): MorphMany
    {
        return $this->morphMany(Assignment::class, 'assignable');
    }
}
