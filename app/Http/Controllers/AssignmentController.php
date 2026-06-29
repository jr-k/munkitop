<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Group;
use App\Models\Package;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssignmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Assignments', [
            'assignments' => Assignment::query()
                ->with('package', 'assignable')
                ->latest()
                ->get()
                ->map(fn (Assignment $assignment) => [
                    'id' => $assignment->id,
                    'action' => $assignment->action,
                    'package' => [
                        'id' => $assignment->package?->id,
                        'name' => $assignment->package?->display_name,
                        'munki_name' => $assignment->package?->munki_name,
                        'icon_url' => $assignment->package?->icon_path
                            ? route('packages.icon', ['package' => $assignment->package->public_id])
                            : null,
                    ],
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
            'groups' => Group::query()
                ->orderBy('name', 'asc')
                ->get(),
            'packages' => Package::query()
                ->withCount('assignments')
                ->orderBy('display_name', 'asc')
                ->get()
                ->map(fn (Package $package) => [
                    ...$package->toArray(),
                    'icon_url' => $package->icon_path ? route('packages.icon', ['package' => $package->public_id]) : null,
                ]),
            'people' => Person::query()
                ->with('groups')
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }

    public function csv(): StreamedResponse
    {
        $assignments = Assignment::query()
            ->with('package', 'assignable')
            ->latest()
            ->get()
            ->map(function (Assignment $assignment) {
                $target = $assignment->assignable;

                return [
                    $assignment->id,
                    $assignment->package?->munki_name,
                    $assignment->package?->display_name,
                    $assignment->action,
                    $assignment->assignable_type === Person::class ? 'person' : 'group',
                    $target instanceof Person
                        ? trim("{$target->first_name} {$target->name}")
                        : ($target instanceof Group ? $target->name : null),
                    $target instanceof Person
                        ? $target->client_identifier
                        : ($target instanceof Group ? $target->slug : null),
                    $assignment->created_at?->toIso8601String(),
                ];
            });

        return $this->streamCsv('munkitop-assignments.csv', [
            'id',
            'package_munki_name',
            'package_display_name',
            'action',
            'target_type',
            'target_name',
            'target_identifier',
            'created_at',
        ], $assignments);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! $request->has('package_ids') && $request->has('package_id')) {
            $request->merge(['package_ids' => [$request->input('package_id')]]);
        }

        if (! $request->has('targets') && $request->has(['target_type', 'target_id'])) {
            $request->merge(['targets' => [$request->input('target_type').':'.$request->input('target_id')]]);
        }

        $data = $request->validate([
            'package_ids' => ['required', 'array', 'min:1'],
            'package_ids.*' => ['integer', 'exists:packages,id'],
            'targets' => ['required', 'array', 'min:1'],
            'targets.*' => ['string', 'regex:/^(person|group):[0-9]+$/'],
            'action' => ['required', Rule::in([Assignment::ACTION_INSTALL, Assignment::ACTION_UNINSTALL])],
        ]);

        foreach (array_unique($data['targets']) as $target) {
            [$targetType, $targetId] = explode(':', $target, 2);
            $assignableClass = $targetType === 'person' ? Person::class : Group::class;
            $assignableClass::query()->findOrFail($targetId);

            foreach (array_unique($data['package_ids']) as $packageId) {
                Assignment::updateOrCreate([
                    'package_id' => $packageId,
                    'assignable_type' => $assignableClass,
                    'assignable_id' => $targetId,
                ], [
                    'action' => $data['action'],
                ]);
            }
        }

        return back()->with('success', ['key' => 'flash.assignmentSaved']);
    }

    public function destroy(Assignment $assignment): \Illuminate\Http\RedirectResponse
    {
        Assignment::query()->whereKey($assignment->getKey())->delete();

        return back()->with('success', ['key' => 'flash.assignmentDeleted']);
    }

    public function bulkDestroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:assignments,id'],
        ]);

        Assignment::query()->whereKey($data['ids'])->delete();

        return back()->with('success', ['key' => 'flash.assignmentsDeleted']);
    }
}
