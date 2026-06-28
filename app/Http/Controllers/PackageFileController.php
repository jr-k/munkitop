<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PackageFileController extends Controller
{
    public function __invoke(Request $request, Package $package): BinaryFileResponse
    {
        abort_if(! $package->pkg_path, 404);

        $path = Storage::disk('local')->path($package->pkg_path);

        abort_if(! File::isFile($path), 404);

        if ($request->boolean('download')) {
            return response()->download($path, basename($package->pkg_path));
        }

        return response()->file($path);
    }
}
