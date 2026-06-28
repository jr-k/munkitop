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
                            ? route('packages.icon', $assignment->package)
                            : null,
                    ],
                    'target' => [
                        'id' => $assignment->assignable?->id,
                        'type' => $assignment->assignable_type === Person::class ? 'person' : 'group',
                        'name' => $assignment->assignable instanceof Person
                            ? trim("{$assignment->assignable->first_name} {$assignment->assignable->name}")
                            : $assignment->assignable?->name,
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
                    'icon_url' => $package->icon_path ? route('packages.icon', $package) : null,
                ]),
            'people' => Person::query()
                ->with('groups')
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'target_type' => ['required', Rule::in(['person', 'group'])],
            'target_id' => ['required', 'integer'],
            'action' => ['required', Rule::in([Assignment::ACTION_INSTALL, Assignment::ACTION_UNINSTALL])],
        ]);

        $assignableClass = $data['target_type'] === 'person' ? Person::class : Group::class;
        $assignableClass::query()->findOrFail($data['target_id']);

        Assignment::updateOrCreate([
            'package_id' => $data['package_id'],
            'assignable_type' => $assignableClass,
            'assignable_id' => $data['target_id'],
            'action' => $data['action'],
        ]);

        return back()->with('success', ['key' => 'flash.assignmentSaved']);
    }

    public function destroy(Assignment $assignment): \Illuminate\Http\RedirectResponse
    {
        Assignment::query()->whereKey($assignment->getKey())->delete();

        return back()->with('success', ['key' => 'flash.assignmentDeleted']);
    }
}
