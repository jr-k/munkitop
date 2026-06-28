<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class PackageIconController extends Controller
{
    public function __invoke(Package $package): Response
    {
        abort_if(! $package->icon_path, 404);

        $path = Storage::disk('local')->path($package->icon_path);

        abort_if(! File::isFile($path), 404);

        $contents = File::get($path);
        $png = $this->extractPng($contents);

        abort_if($png === null, 404);

        return response($png, 200, [
            'Cache-Control' => 'public, max-age=3600',
            'Content-Type' => 'image/png',
        ]);
    }

    private function extractPng(string $contents): ?string
    {
        $signature = "\x89PNG\r\n\x1a\n";
        $start = strpos($contents, $signature);

        if ($start === false) {
            return null;
        }

        $offset = $start + strlen($signature);
        $length = strlen($contents);

        while ($offset + 8 <= $length) {
            $chunkLength = unpack('N', substr($contents, $offset, 4))[1];
            $chunkType = substr($contents, $offset + 4, 4);
            $chunkEnd = $offset + 8 + $chunkLength + 4;

            if ($chunkEnd > $length) {
                return null;
            }

            if ($chunkType === 'IEND') {
                return substr($contents, $start, $chunkEnd - $start);
            }

            $offset = $chunkEnd;
        }

        return null;
    }
}
