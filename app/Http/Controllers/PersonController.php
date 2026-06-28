<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PersonController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('People', [
            'people' => Person::query()
                ->with('groups')
                ->orderBy('name', 'asc')
                ->get()
                ->map(fn (Person $person) => [
                    ...$person->toArray(),
                    'manifest' => $this->manifestPreview($person->client_identifier),
                ]),
            'groups' => Group::query()
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $this->validatedData($request);
        $groupIds = $this->withDefaultGroup($data['group_ids'] ?? []);
        unset($data['group_ids']);

        $person = Person::create($data);
        $person->groups()->sync($groupIds);

        return back()->with('success', ['key' => 'flash.personCreated']);
    }

    public function update(Request $request, Person $person): \Illuminate\Http\RedirectResponse
    {
        $data = $this->validatedData($request, $person);
        $groupIds = $this->withDefaultGroup($data['group_ids'] ?? []);
        unset($data['group_ids']);

        $person->update($data);
        $person->groups()->sync($groupIds);

        return back()->with('success', ['key' => 'flash.personUpdated']);
    }

    public function destroy(Person $person): \Illuminate\Http\RedirectResponse
    {
        Person::query()->whereKey($person->getKey())->delete();

        return back()->with('success', ['key' => 'flash.personDeleted']);
    }

    private function validatedData(Request $request, ?Person $person = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('people', 'email')->ignore($person)],
            'notes' => ['nullable', 'string'],
            'group_ids' => ['array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ]);

        $data['client_identifier'] = $data['email'];

        return $data;
    }

    private function withDefaultGroup(array $groupIds): array
    {
        $defaultGroupId = Group::query()
            ->firstOrCreate(
                ['slug' => Group::DEFAULT_SLUG],
                [
                    'name' => 'Default',
                    'notes' => 'System group automatically included for all people.',
                    'is_system' => true,
                ],
            )
            ->getKey();

        return array_values(array_unique([...$groupIds, $defaultGroupId]));
    }
}
