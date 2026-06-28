<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Group;
use App\Models\Package;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Packages', [
            'packages' => Package::query()
                ->with('assignments.assignable')
                ->withCount('assignments')
                ->orderBy('display_name')
                ->get()
                ->map(fn (Package $package) => [
                    'id' => $package->id,
                    'munki_name' => $package->munki_name,
                    'display_name' => $package->display_name,
                    'bundle_identifier' => $package->bundle_identifier,
                    'version' => $package->version,
                    'icon_path' => $package->icon_path,
                    'icon_url' => $package->icon_path ? route('packages.icon', $package) : null,
                    'pkg_path' => $package->pkg_path,
                    'pkg_file_url' => $package->pkg_path ? route('packages.file', $package) : null,
                    'hash' => $package->hash,
                    'pkg_url' => $package->pkg_url,
                    'active' => $package->active,
                    'assignments_count' => $package->assignments_count,
                    'assignments' => $package->assignments->map(fn (Assignment $assignment) => [
                        'id' => $assignment->id,
                        'action' => $assignment->action,
                        'target' => [
                            'id' => $assignment->assignable?->id,
                            'type' => $assignment->assignable_type === Person::class ? 'person' : 'group',
                            'name' => $assignment->assignable instanceof Person
                                ? trim("{$assignment->assignable->first_name} {$assignment->assignable->name}")
                                : $assignment->assignable?->name,
                            'identifier' => $assignment->assignable instanceof Person
                                ? $assignment->assignable->client_identifier
                                : ($assignment->assignable instanceof Group ? $assignment->assignable->slug : null),
                        ],
                    ]),
                ]),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['active'] = (bool) ($data['active'] ?? true);

        if ($request->hasFile('icon')) {
            $data['icon_path'] = $request->file('icon')->store('icons');
        }

        if ($request->hasFile('pkg_file')) {
            $data = $this->storeUploadedPackage($request->file('pkg_file'), $data);
        }

        unset($data['icon'], $data['pkg_file']);

        Package::create($data);

        return back()->with('success', ['key' => 'flash.packageImported']);
    }

    public function update(Request $request, Package $package): \Illuminate\Http\RedirectResponse
    {
        $data = $this->validatedData($request, $package);
        $data['active'] = (bool) ($data['active'] ?? false);

        if ($request->hasFile('icon')) {
            $data['icon_path'] = $request->file('icon')->store('icons');
        }

        if ($request->hasFile('pkg_file')) {
            $data = $this->storeUploadedPackage($request->file('pkg_file'), $data);
        }

        unset($data['icon'], $data['pkg_file']);

        $package->update($data);

        return back()->with('success', ['key' => 'flash.packageUpdated']);
    }

    public function destroy(Package $package): \Illuminate\Http\RedirectResponse
    {
        Package::query()->whereKey($package->getKey())->delete();

        return back()->with('success', ['key' => 'flash.packageDeleted']);
    }

    public function bulkDestroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:packages,id'],
        ]);

        Package::query()->whereKey($data['ids'])->delete();

        return back()->with('success', ['key' => 'flash.packagesDeleted']);
    }

    private function validatedData(Request $request, ?Package $package = null): array
    {
        $needsPackageSource = ! $request->hasFile('pkg_file')
            && ! $package?->pkg_path
            && ! $package?->pkg_url;

        return $request->validate([
            'munki_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z0-9 ._-]+$/',
                Rule::unique('packages', 'munki_name')->ignore($package),
            ],
            'display_name' => ['required', 'string', 'max:255'],
            'bundle_identifier' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9.-]+$/'],
            'version' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'file', 'max:4096'],
            'pkg_file' => ['nullable', 'file', 'max:5242880', 'extensions:pkg,dmg'],
            'hash' => [
                Rule::requiredIf(! $request->hasFile('pkg_file') && ! $package?->hash),
                'nullable',
                'string',
                'regex:/^[a-fA-F0-9]{64}$/',
            ],
            'pkg_url' => [Rule::requiredIf($needsPackageSource), 'nullable', 'url', 'max:2048'],
            'active' => ['boolean'],
        ]);
    }

    private function storeUploadedPackage(UploadedFile $file, array $data): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['pkg', 'dmg'], true)) {
            $extension = 'pkg';
        }

        $fileName = Str::of($data['munki_name'])
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->trim('-')
            ->append('.'.$extension)
            ->value();

        $path = $file->storeAs('packages', $fileName);
        $data['pkg_path'] = $path;
        $data['pkg_url'] = null;

        $data['hash'] = hash_file('sha256', Storage::disk('local')->path($path));

        return $data;
    }
}
