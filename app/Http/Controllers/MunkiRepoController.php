<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MunkiRepoController extends Controller
{
    public function index(): Response
    {
        $repoPath = realpath($this->repoPath());
        abort_if($repoPath === false, 404);

        return response($this->directoryIndex($repoPath), 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    public function show(string $path): BinaryFileResponse
    {
        $repoPath = realpath($this->repoPath());
        abort_if($repoPath === false, 404);

        $filePath = realpath($repoPath.'/'.ltrim($path, '/'));
        abort_if(
            $filePath === false
                || ! str_starts_with($filePath, $repoPath.DIRECTORY_SEPARATOR)
                || ! File::isFile($filePath),
            404,
        );

        return response()->file($filePath);
    }

    private function directoryIndex(string $repoPath): string
    {
        $directories = collect(File::directories($repoPath))
            ->map(fn (string $directory) => basename($directory).'/')
            ->sort()
            ->values()
            ->all();

        return implode(PHP_EOL, [
            'Munkitop repository',
            '',
            ...$directories,
        ]);
    }
}
