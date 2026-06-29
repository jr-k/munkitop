<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class PackageMetadataExtractor
{
    public function extract(string $packagePath, string $workingPath): array
    {
        File::ensureDirectoryExists($workingPath);

        $extension = strtolower(pathinfo($packagePath, PATHINFO_EXTENSION));
        $extractPath = $workingPath.'/extract';

        File::ensureDirectoryExists($extractPath);

        if ($extension === 'dmg') {
            $this->extractDmg($packagePath, $extractPath);
        } else {
            $this->extractPkg($packagePath, $extractPath);
        }

        $appPath = $this->firstAppBundle($extractPath);
        $metadata = [
            'munki_name' => Str::of(pathinfo($packagePath, PATHINFO_FILENAME))
                ->replaceMatches('/[^A-Za-z0-9 ._-]+/', ' ')
                ->squish()
                ->value(),
            'display_name' => Str::of(pathinfo($packagePath, PATHINFO_FILENAME))->replace(['-', '_'], ' ')->squish()->value(),
            'bundle_identifier' => null,
            'version' => null,
            'icon_path' => null,
        ];

        if (! $appPath) {
            return $metadata;
        }

        $appName = Str::beforeLast(basename($appPath), '.app');
        $metadata['munki_name'] = $this->munkiName($appName);
        $metadata['display_name'] = $appName;

        $plistPath = $appPath.'/Contents/Info.plist';
        $plist = File::exists($plistPath) ? $this->readPlist($plistPath) : [];

        $metadata['bundle_identifier'] = $plist['CFBundleIdentifier'] ?? null;
        $metadata['version'] = $plist['CFBundleShortVersionString'] ?? $plist['CFBundleVersion'] ?? null;

        $iconPath = $this->copyIcon($appPath, $workingPath, $plist['CFBundleIconFile'] ?? null);

        if ($iconPath) {
            $metadata['icon_path'] = $iconPath;
        }

        return $metadata;
    }

    private function extractPkg(string $packagePath, string $extractPath): void
    {
        if ($this->commandExists('xar')) {
            $this->run(['xar', '-xf', $packagePath, '-C', $extractPath]);
        }

        foreach (File::allFiles($extractPath) as $file) {
            if ($file->getFilename() !== 'Payload') {
                continue;
            }

            $payloadPath = $file->getPathname();
            $payloadExtractPath = $file->getPath().'/payload';

            File::ensureDirectoryExists($payloadExtractPath);

            $this->runShell(
                'gzip -dc '.escapeshellarg($payloadPath).' 2>/dev/null | cpio -idm --quiet',
                $payloadExtractPath,
            );
        }
    }

    private function extractDmg(string $packagePath, string $extractPath): void
    {
        if ($this->commandExists('7z')) {
            $this->run(['7z', 'x', '-y', '-o'.$extractPath, $packagePath]);
        }
    }

    private function firstAppBundle(string $path): ?string
    {
        if (! File::isDirectory($path)) {
            return null;
        }

        foreach (File::directories($path) as $directory) {
            if (Str::endsWith($directory, '.app')) {
                return $directory;
            }

            $appPath = $this->firstAppBundle($directory);

            if ($appPath) {
                return $appPath;
            }
        }

        return null;
    }

    private function readPlist(string $path): array
    {
        $xml = File::get($path);

        if (! str_starts_with(trim($xml), '<?xml')) {
            $xml = $this->convertBinaryPlist($path);
        }

        if (! $xml) {
            return [];
        }

        $plist = @simplexml_load_string($xml);

        if (! $plist || ! isset($plist->dict)) {
            return [];
        }

        $values = [];
        $currentKey = null;

        foreach ($plist->dict->children() as $node) {
            if ($node->getName() === 'key') {
                $currentKey = (string) $node;

                continue;
            }

            if ($currentKey) {
                $values[$currentKey] = (string) $node;
                $currentKey = null;
            }
        }

        return $values;
    }

    private function convertBinaryPlist(string $path): ?string
    {
        foreach ([
            ['plistutil', '-i', $path, '-f', 'xml'],
            ['plutil', '-convert', 'xml1', '-o', '-', $path],
        ] as $command) {
            if (! $this->commandExists($command[0])) {
                continue;
            }

            $process = new Process($command);
            $process->run();

            if ($process->isSuccessful() && trim($process->getOutput()) !== '') {
                return $process->getOutput();
            }
        }

        return null;
    }

    private function copyIcon(string $appPath, string $workingPath, ?string $iconFile): ?string
    {
        if (! $iconFile) {
            return null;
        }

        $iconFile = Str::endsWith(strtolower($iconFile), '.icns') ? $iconFile : $iconFile.'.icns';
        $sourcePath = $appPath.'/Contents/Resources/'.$iconFile;

        if (! File::exists($sourcePath)) {
            return null;
        }

        $iconPath = $workingPath.'/icon.icns';

        File::copy($sourcePath, $iconPath);

        return $iconPath;
    }

    private function munkiName(string $name): string
    {
        return Str::of($name)
            ->replaceMatches('/[^A-Za-z0-9 ._-]+/', ' ')
            ->squish()
            ->value();
    }

    private function commandExists(string $command): bool
    {
        $process = Process::fromShellCommandline('command -v '.escapeshellarg($command));
        $process->run();

        return $process->isSuccessful();
    }

    private function run(array $command, ?string $cwd = null): void
    {
        $process = new Process($command, $cwd);
        $process->setTimeout(120);
        $process->run();
    }

    private function runShell(string $command, string $cwd): void
    {
        $process = Process::fromShellCommandline($command, $cwd);
        $process->setTimeout(120);
        $process->run();
    }
}
