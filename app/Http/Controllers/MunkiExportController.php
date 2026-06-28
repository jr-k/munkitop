<?php

namespace App\Http\Controllers;

use App\Services\MunkiManifestGenerator;

class MunkiExportController extends Controller
{
    public function __invoke(MunkiManifestGenerator $generator): \Illuminate\Http\RedirectResponse
    {
        $result = $generator->export();

        return back()->with(
            'success',
            [
                'key' => 'flash.munkiExported',
                'params' => [
                    'path' => $result['path'],
                    'packages' => $result['packages'],
                    'groups' => $result['groups'],
                    'people' => $result['people'],
                ],
            ],
        );
    }
}
