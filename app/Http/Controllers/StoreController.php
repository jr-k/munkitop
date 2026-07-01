<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Package;
use App\Models\Person;
use App\Services\MunkiManifestGenerator;
use App\Services\PublicStoreSettings;
use DOMDocument;
use DOMElement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(Request $request, PublicStoreSettings $settings): Response
    {
        if ($request->user()?->isAdministrator()) {
            return Inertia::render('StoreSettings', [
                'settings' => $settings->payload(),
                'publicStoreUrl' => route('store.public'),
            ]);
        }

        return $this->catalog($request, $settings);
    }

    public function publicStore(Request $request, PublicStoreSettings $settings): Response
    {
        return $this->catalog($request, $settings);
    }

    public function package(Request $request, Package $package, PublicStoreSettings $settings): Response
    {
        $user = $request->user()?->loadMissing('person.groups.assignments.package', 'person.assignments.package');
        $person = $user?->person;

        abort_unless($person instanceof Person || $user?->isAdministrator(), 403);
        abort_unless($package->active && ($package->on_public_store || $user?->isAdministrator()), 404);

        $availability = Assignment::ACTION_ON_DEMAND;
        $canToggle = false;
        $manifestAvailable = false;

        if ($person instanceof Person) {
            $resolvedAssignments = $this->resolvedPersonAssignments($person);
            $availability = ($resolvedAssignments[$package->id] ?? null)?->action;
            $canToggle = in_array($availability, [
                Assignment::ACTION_ON_DEMAND,
                Assignment::ACTION_OPTIONAL_INSTALL,
            ], true);
            $manifestAvailable = $this->manifestPackageActions($person) !== null;

            abort_unless(
                $package->on_public_store
                    && $availability !== null
                    && $availability !== Assignment::ACTION_UNINSTALL,
                404,
            );
        }

        return Inertia::render('StorePackage', [
            'person' => [
                'id' => $person?->id,
                'name' => $person instanceof Person ? trim("{$person->first_name} {$person->name}") : ($user?->name ?? 'Admin'),
                'email' => $person instanceof Person ? $person->email : ($user?->email ?? ''),
            ],
            'package' => $this->packagePayload($package, $availability, $canToggle),
            'manifest_available' => $manifestAvailable,
            'settings' => $settings->payload(),
        ]);
    }

    public function update(Request $request, PublicStoreSettings $settings): RedirectResponse
    {
        abort_unless($request->user()?->isAdministrator(), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'main_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'max:4096'],
        ]);

        $logoPath = null;

        if ($request->hasFile('logo')) {
            if ($settings->logoPath()) {
                Storage::disk('local')->delete($settings->logoPath());
            }

            $logoPath = $request->file('logo')->store('store');
        }

        $settings->update($data['name'], $data['main_color'], $logoPath);

        return back()->with('success', ['key' => 'flash.storeSettingsUpdated']);
    }

    public function logo(PublicStoreSettings $settings): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $path = $settings->logoPath();

        abort_if(! $path, 404);

        $absolutePath = Storage::disk('local')->path($path);

        abort_unless(is_file($absolutePath), 404);

        return response()->file($absolutePath, [
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function catalog(Request $request, PublicStoreSettings $settings): Response
    {
        $user = $request->user()?->loadMissing('person.groups.assignments.package', 'person.assignments.package');
        $person = $user?->person;

        abort_unless($person instanceof Person || $user?->isAdministrator(), 403);

        if (! $person instanceof Person) {
            $catalog = Package::query()
                ->where('active', true)
                ->where('on_public_store', true)
                ->orderBy('category')
                ->orderBy('display_name')
                ->get()
                ->map(fn (Package $package) => $this->packagePayload($package, Assignment::ACTION_ON_DEMAND, false))
                ->values();

            return Inertia::render('Store', [
                'person' => [
                    'id' => null,
                    'name' => $user?->name ?? 'Admin',
                    'email' => $user?->email ?? '',
                ],
                'packages' => $catalog,
                'categories' => Package::CATEGORIES,
                'manifest_available' => false,
                'settings' => $settings->payload(),
            ]);
        }

        $manifestAvailable = $this->manifestPackageActions($person) !== null;
        $resolvedAssignments = $this->resolvedPersonAssignments($person);
        $storeVisibleAssignments = array_filter(
            $resolvedAssignments,
            fn (Assignment $assignment) => $assignment->action !== Assignment::ACTION_UNINSTALL,
        );

        $catalog = Package::query()
            ->where('active', true)
            ->where('on_public_store', true)
            ->whereIn('id', array_keys($storeVisibleAssignments))
            ->orderBy('category')
            ->orderBy('display_name')
            ->get()
            ->map(function (Package $package) use ($resolvedAssignments): array {
                $availability = ($resolvedAssignments[$package->id] ?? null)?->action;

                return $this->packagePayload(
                    $package,
                    $availability,
                    in_array($availability, [
                        Assignment::ACTION_ON_DEMAND,
                        Assignment::ACTION_OPTIONAL_INSTALL,
                    ], true),
                );
            })
            ->values();

        return Inertia::render('Store', [
            'person' => [
                'id' => $person->id,
                'name' => trim("{$person->first_name} {$person->name}"),
                'email' => $person->email,
            ],
            'packages' => $catalog,
            'categories' => Package::CATEGORIES,
            'manifest_available' => $manifestAvailable,
            'settings' => $settings->payload(),
        ]);
    }

    public function updateChoice(Request $request, Package $package): RedirectResponse
    {
        $user = $request->user()?->loadMissing('person.groups.assignments.package', 'person.assignments.package');
        $person = $user?->person;

        abort_unless($person instanceof Person, 403);

        $data = $request->validate([
            'installed' => ['required', 'boolean'],
        ]);

        $resolvedAssignments = $this->resolvedPersonAssignments($person);
        $currentAction = ($resolvedAssignments[$package->id] ?? null)?->action;

        abort_unless(
            $package->active
                && $package->on_public_store
                && $currentAction !== null
                && in_array($currentAction, [
                    Assignment::ACTION_ON_DEMAND,
                    Assignment::ACTION_OPTIONAL_INSTALL,
                ], true),
            403,
        );

        Assignment::updateOrCreate([
            'package_id' => $package->id,
            'assignable_type' => Person::class,
            'assignable_id' => $person->id,
        ], [
            'action' => $data['installed'] ? Assignment::ACTION_OPTIONAL_INSTALL : Assignment::ACTION_ON_DEMAND,
        ]);

        app(MunkiManifestGenerator::class)->export();

        return back()->with('success', ['key' => 'flash.storeChoiceUpdated']);
    }

    private function packagePayload(Package $package, ?string $availability, bool $canToggle): array
    {
        return [
            'id' => $package->id,
            'munki_name' => $package->munki_name,
            'display_name' => $package->display_name,
            'category' => $package->category,
            'description' => $package->description,
            'bundle_identifier' => $package->bundle_identifier,
            'version' => $package->version,
            'icon_url' => $package->icon_path ? route('store.packages.icon', ['package' => $package->public_id]) : null,
            'store_url' => route('store.packages.show', ['package' => $package->public_id]),
            'availability' => $availability,
            'on_public_store' => $package->on_public_store,
            'can_toggle' => $canToggle,
        ];
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

        return $assignmentsByPackage;
    }

    private function manifestPackageActions(Person $person): ?array
    {
        $path = $this->repoPath().'/manifests/'.$person->client_identifier;

        if (! File::isFile($path)) {
            return null;
        }

        $document = new DOMDocument();
        $document->load($path);
        $actions = [];

        foreach ([
            Assignment::ACTION_INSTALL => 'managed_installs',
            Assignment::ACTION_UNINSTALL => 'managed_uninstalls',
            Assignment::ACTION_ON_DEMAND => 'optional_installs',
            Assignment::ACTION_OPTIONAL_INSTALL => 'default_installs',
        ] as $action => $manifestKey) {
            foreach ($this->manifestArrayValues($document, $manifestKey) as $munkiName) {
                $actions[$munkiName] = $action;
            }
        }

        return $actions;
    }

    private function manifestArrayValues(DOMDocument $document, string $key): array
    {
        foreach ($document->getElementsByTagName('key') as $keyNode) {
            if ($keyNode->textContent !== $key) {
                continue;
            }

            $arrayNode = $keyNode->nextSibling;

            while ($arrayNode && ! $arrayNode instanceof DOMElement) {
                $arrayNode = $arrayNode->nextSibling;
            }

            if (! $arrayNode instanceof DOMElement || $arrayNode->tagName !== 'array') {
                return [];
            }

            $values = [];

            foreach ($arrayNode->childNodes as $childNode) {
                if ($childNode instanceof DOMElement && $childNode->tagName === 'string') {
                    $values[] = $childNode->textContent;
                }
            }

            return $values;
        }

        return [];
    }
}
