<?php

namespace App\Services;

use App\Models\Group;
use App\Models\Package;
use App\Models\Person;
use DOMDocument;
use DOMElement;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MunkiManifestGenerator
{
    public function export(): array
    {
        $repoPath = $this->repoPath();
        $manifestPath = $repoPath.'/manifests';
        $pkginfoPath = $repoPath.'/pkgsinfo';
        $catalogPath = $repoPath.'/catalogs';
        $iconPath = $repoPath.'/icons';
        $packagePath = $repoPath.'/pkgs';

        $this->cleanExportDirectories([$manifestPath, $pkginfoPath, $catalogPath, $iconPath, $packagePath]);

        File::ensureDirectoryExists($manifestPath);
        File::ensureDirectoryExists($pkginfoPath);
        File::ensureDirectoryExists($catalogPath);
        File::ensureDirectoryExists($iconPath);
        File::ensureDirectoryExists($packagePath);
        $this->ensurePublicRepoLinks($repoPath);

        $packages = Package::query()->where('active', true)->orderBy('munki_name')->get();
        $groups = Group::query()->with(['assignments.package'])->orderBy('slug')->get();
        $people = Person::query()
            ->with(['groups.assignments.package', 'assignments.package'])
            ->orderBy('client_identifier')
            ->get();

        $this->writePlist($manifestPath.'/'.config('munki.base_manifest'), [
            'catalogs' => [config('munki.default_catalog')],
        ]);

        $catalogItems = [];

        foreach ($packages as $package) {
            /** @var Package $package */
            $catalogItems[] = $this->writePackageInfo($pkginfoPath, $iconPath, $packagePath, $package);
        }

        $this->writePlist($catalogPath.'/'.config('munki.default_catalog'), $catalogItems);
        $this->writePlist($catalogPath.'/all', $catalogItems);
        $this->writeRepoIndex($repoPath);

        foreach ($groups as $group) {
            $this->writeManifest($manifestPath.'/'.$group->slug, [config('munki.base_manifest')], $group->assignments);
        }

        foreach ($people as $person) {
            $this->writeManifest(
                $manifestPath.'/'.$person->client_identifier,
                [config('munki.base_manifest')],
                $this->resolvedPersonAssignments($person),
            );
        }

        return [
            'path' => $repoPath,
            'packages' => $packages->count(),
            'groups' => $groups->count(),
            'people' => $people->count(),
        ];
    }

    private function cleanExportDirectories(array $paths): void
    {
        foreach ($paths as $path) {
            if (! File::isDirectory($path)) {
                continue;
            }

            File::cleanDirectory($path);
        }
    }

    private function ensurePublicRepoLinks(string $repoPath): void
    {
        $this->ensurePublicLink('repo', $repoPath);
        $this->ensurePublicLink('catalogs', $repoPath.'/catalogs');
        $this->ensurePublicLink('icons', $repoPath.'/icons');
        $this->ensurePublicLink('manifests', $repoPath.'/manifests');
        $this->ensurePublicLink('pkgs', $repoPath.'/pkgs');
        $this->ensurePublicLink('pkgsinfo', $repoPath.'/pkgsinfo');
    }

    private function ensurePublicLink(string $name, string $targetPath): void
    {
        $linkPath = public_path($name);

        if (File::exists($linkPath) || is_link($linkPath)) {
            return;
        }

        $target = Str::startsWith($targetPath, base_path().DIRECTORY_SEPARATOR)
            ? '../'.Str::after($targetPath, base_path().DIRECTORY_SEPARATOR)
            : $targetPath;

        @symlink($target, $linkPath);
    }

    private function writeRepoIndex(string $repoPath): void
    {
        File::put($repoPath.'/index.html', implode(PHP_EOL, [
            '<!doctype html>',
            '<html lang="en">',
            '<head><meta charset="utf-8"><title>Munkitop Repository</title></head>',
            '<body>',
            '<h1>Munkitop Repository</h1>',
            '<ul>',
            '<li><a href="catalogs/'.config('munki.default_catalog').'">catalogs/'.config('munki.default_catalog').'</a></li>',
            '<li><a href="catalogs/all">catalogs/all</a></li>',
            '<li><a href="manifests/'.config('munki.base_manifest').'">manifests/'.config('munki.base_manifest').'</a></li>',
            '</ul>',
            '</body>',
            '</html>',
        ]));
    }

    private function writePackageInfo(string $pkginfoPath, string $iconPath, string $packagePath, Package $package): array
    {
        $installerItemLocation = $package->pkg_url;
        $packageExtension = $this->packageExtension($package);

        if ($package->pkg_path) {
            $packageFilePath = $this->packageRepositoryLocation($package);
            $storedPackagePath = Storage::disk('local')->path($package->pkg_path);

            if (File::exists($storedPackagePath)) {
                File::ensureDirectoryExists(dirname($packagePath.'/'.$packageFilePath));
                File::copy($storedPackagePath, $packagePath.'/'.$packageFilePath);
                $installerItemLocation = $this->urlPath($packageFilePath);
            }
        }

        $pkginfo = [
            'name' => $package->munki_name,
            'display_name' => $package->display_name,
            'category' => $this->categoryLabel($package->category),
            'installer_item_location' => $installerItemLocation,
            'installer_item_hash' => $package->hash,
            'unattended_install' => true,
            'unattended_uninstall' => true,
        ];

        if ($packageExtension === 'dmg') {
            $pkginfo['installer_type'] = 'copy_from_dmg';
            $pkginfo['items_to_copy'] = [[
                'source_item' => $this->appBundleName($package),
                'destination_path' => '/Applications',
            ]];
        }

        if ($package->version) {
            $pkginfo['version'] = $package->version;
        }

        if ($package->bundle_identifier) {
            $installItem = [
                'type' => 'application',
                'CFBundleIdentifier' => $package->bundle_identifier,
            ];

            if ($package->version) {
                $installItem['CFBundleShortVersionString'] = $package->version;
            }

            $pkginfo['installs'] = [$installItem];
        }

        if ($package->icon_path) {
            $iconName = $this->safeFileName($package->munki_name).'.icns';
            $storedIconPath = Storage::disk('local')->path($package->icon_path);

            if (File::exists($storedIconPath)) {
                File::copy($storedIconPath, $iconPath.'/'.$iconName);
                $pkginfo['icon_name'] = $iconName;
            }
        }

        $this->writePlist($pkginfoPath.'/'.$this->safeFileName($package->munki_name).'.plist', $pkginfo);

        return $pkginfo;
    }

    private function writeManifest(string $path, array $includedManifests, mixed $assignments): void
    {
        $installs = [];
        $uninstalls = [];

        foreach ($assignments as $assignment) {
            if (! $assignment->package || ! $assignment->package->active) {
                continue;
            }

            if ($assignment->action === 'uninstall') {
                $uninstalls[] = $assignment->package->munki_name;
            } else {
                $installs[] = $assignment->package->munki_name;
            }
        }

        $manifest = [
            'catalogs' => [config('munki.default_catalog')],
            'included_manifests' => array_values(array_unique($includedManifests)),
            'managed_installs' => array_values(array_unique($installs)),
            'managed_uninstalls' => array_values(array_unique($uninstalls)),
        ];

        $this->writePlist($path, $manifest);
    }

    private function resolvedPersonAssignments(Person $person): array
    {
        $assignmentsByPackage = [];

        foreach ($person->groups->sortBy('slug') as $group) {
            foreach ($group->assignments as $assignment) {
                $assignmentsByPackage[$assignment->package_id] = $assignment;
            }
        }

        foreach ($person->assignments as $assignment) {
            $assignmentsByPackage[$assignment->package_id] = $assignment;
        }

        return array_values($assignmentsByPackage);
    }

    private function writePlist(string $path, array $data): void
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        $document->formatOutput = true;
        $document->appendChild($document->implementation->createDocumentType(
            'plist',
            '-//Apple//DTD PLIST 1.0//EN',
            'http://www.apple.com/DTDs/PropertyList-1.0.dtd',
        ));

        $plist = $document->createElement('plist');
        $plist->setAttribute('version', '1.0');
        $document->appendChild($plist);
        $plist->appendChild($this->valueNode($document, $data));

        File::put($path, $document->saveXML());
    }

    private function valueNode(DOMDocument $document, mixed $value): DOMElement
    {
        if (is_array($value)) {
            if (array_is_list($value)) {
                $array = $document->createElement('array');

                foreach ($value as $item) {
                    $array->appendChild($this->valueNode($document, $item));
                }

                return $array;
            }

            $dict = $document->createElement('dict');

            foreach ($value as $key => $item) {
                $dict->appendChild($document->createElement('key', (string) $key));
                $dict->appendChild($this->valueNode($document, $item));
            }

            return $dict;
        }

        if (is_bool($value)) {
            return $document->createElement($value ? 'true' : 'false');
        }

        if (is_int($value)) {
            return $document->createElement('integer', (string) $value);
        }

        return $document->createElement('string', (string) $value);
    }

    private function repoPath(): string
    {
        $path = (string) config('munki.repo_path');

        return Str::startsWith($path, '/') ? $path : base_path($path);
    }

    private function packageExtension(Package $package): string
    {
        $path = $package->pkg_path ?: (string) parse_url((string) $package->pkg_url, PHP_URL_PATH);
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return $extension === 'dmg' ? 'dmg' : 'pkg';
    }

    private function packageRepositoryLocation(Package $package): string
    {
        $path = str_replace('\\', '/', (string) $package->pkg_path);

        if (Str::startsWith($path, 'packages/')) {
            return Str::after($path, 'packages/');
        }

        return basename($path);
    }

    private function urlPath(string $path): string
    {
        return collect(explode('/', $path))
            ->map(fn (string $segment) => rawurlencode($segment))
            ->implode('/');
    }

    private function categoryLabel(?string $category): string
    {
        return [
            'browsers' => 'Browsers',
            'developer_tools' => 'Developer Tools',
            'security' => 'Security',
            'productivity' => 'Productivity',
            'communication' => 'Communication',
            'internal' => 'Internal',
            'utilities' => 'Utilities',
            'media' => 'Media',
            'system' => 'System',
        ][$category ?? 'utilities'] ?? 'Utilities';
    }

    private function appBundleName(Package $package): string
    {
        $displayName = trim($package->display_name);

        return Str::endsWith(strtolower($displayName), '.app') ? $displayName : $displayName.'.app';
    }

    private function safeFileName(string $name): string
    {
        return Str::of($name)
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->trim('-')
            ->value();
    }
}
