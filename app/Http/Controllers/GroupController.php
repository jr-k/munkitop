<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Groups', [
            'groups' => Group::query()
                ->withCount('people')
                ->orderBy('name')
                ->get()
                ->map(fn (Group $group) => [
                    ...$group->toArray(),
                    'manifest' => $this->manifestPreview($group->slug),
                ]),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $this->validatedData($request);

        Group::create($data);

        return back()->with('success', ['key' => 'flash.groupCreated']);
    }

    public function update(Request $request, Group $group): \Illuminate\Http\RedirectResponse
    {
        if ($group->is_system) {
            return back()->with('error', ['key' => 'flash.defaultGroupLocked']);
        }

        $data = $this->validatedData($request, $group);

        $group->update($data);

        return back()->with('success', ['key' => 'flash.groupUpdated']);
    }

    public function destroy(Group $group): \Illuminate\Http\RedirectResponse
    {
        if ($group->is_system) {
            return back()->with('error', ['key' => 'flash.defaultGroupDeleteLocked']);
        }

        Group::query()->whereKey($group->getKey())->delete();

        return back()->with('success', ['key' => 'flash.groupDeleted']);
    }

    private function validatedData(Request $request, ?Group $group = null): array
    {
        $request->merge([
            'slug' => $request->string('slug')->trim()->value()
                ?: Str::slug($request->string('name')->toString(), '-'),
        ]);

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('groups', 'slug')->ignore($group),
            ],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
