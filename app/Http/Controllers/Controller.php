<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

abstract class Controller
{
    protected function manifestPreview(string $name): array
    {
        $relativePath = 'manifests/'.$name;
        $path = $this->repoPath().'/'.$relativePath;

        return [
            'path' => $relativePath,
            'url' => app(\App\Services\MunkiExternalUrl::class)->repoUrl().'/'.$relativePath,
            'content' => File::isFile($path) ? File::get($path) : null,
        ];
    }

    protected function repoPath(): string
    {
        $path = (string) config('munki.repo_path');

        return Str::startsWith($path, '/') ? $path : base_path($path);
    }
}
