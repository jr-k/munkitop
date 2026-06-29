<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeUserManagement($request);

        return Inertia::render('Users', [
            'users' => User::query()
                ->with('permissions')
                ->orderByRaw("case role when ? then 0 when ? then 1 else 2 end", [User::ROLE_OWNER, User::ROLE_ADMIN])
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => $this->userPayload($user)),
            'permissionResources' => User::PERMISSION_RESOURCES,
            'permissionActions' => User::PERMISSION_ACTIONS,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeUserManagement($request);

        $data = $this->validatedData($request);

        DB::transaction(function () use ($data): void {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
                'is_owner' => false,
            ]);

            $this->syncPermissions($user, $data['permissions'] ?? [], (bool) ($data['export'] ?? false));
        });

        return back()->with('success', ['key' => 'flash.userCreated']);
    }

    public function update(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeUserManagement($request);

        if ($user->is_owner) {
            return back()->with('error', ['key' => 'flash.ownerLocked']);
        }

        $data = $this->validatedData($request, $user);

        DB::transaction(function () use ($data, $user): void {
            $payload = [
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
                'is_owner' => false,
            ];

            if (! empty($data['password'])) {
                $payload['password'] = $data['password'];
            }

            $user->update($payload);
            $this->syncPermissions($user, $data['permissions'] ?? [], (bool) ($data['export'] ?? false));
        });

        return back()->with('success', ['key' => 'flash.userUpdated']);
    }

    public function destroy(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeUserManagement($request);

        if ($user->is_owner) {
            return back()->with('error', ['key' => 'flash.ownerDeleteLocked']);
        }

        User::query()->whereKey($user->getKey())->delete();

        return back()->with('success', ['key' => 'flash.userDeleted']);
    }

    private function validatedData(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'max:255'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_USER])],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in($this->allowedPermissionKeys())],
            'export' => ['boolean'],
        ]);
    }

    private function syncPermissions(User $user, array $permissionKeys, bool $canExport): void
    {
        $user->permissions()->delete();

        if ($user->role === User::ROLE_ADMIN) {
            return;
        }

        $permissions = collect($permissionKeys)
            ->map(fn (string $permission) => explode('.', $permission, 2))
            ->filter(fn (array $parts) => count($parts) === 2)
            ->map(fn (array $parts) => [
                'resource' => $parts[0],
                'action' => $parts[1],
            ]);

        if ($canExport) {
            $permissions->push([
                'resource' => User::EXPORT_PERMISSION,
                'action' => User::EXPORT_PERMISSION,
            ]);
        }

        $user->permissions()->createMany($permissions->unique(fn (array $permission) => $permission['resource'].'.'.$permission['action'])->values()->all());
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_owner' => $user->is_owner,
            'permissions' => $user->permissionKeys(),
            'created_at' => $user->created_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ];
    }

    private function allowedPermissionKeys(): array
    {
        return collect(User::PERMISSION_RESOURCES)
            ->flatMap(fn (string $resource) => collect(User::PERMISSION_ACTIONS)
                ->map(fn (string $action) => "{$resource}.{$action}"))
            ->all();
    }

    private function authorizeUserManagement(Request $request): void
    {
        abort_unless($request->user()?->canManageUsers(), 403);
    }
}
