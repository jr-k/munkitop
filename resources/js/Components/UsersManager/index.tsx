import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import { TranslationKey, useI18n } from '../../i18n';
import { ManagedUser, PermissionAction, PermissionResource, UserRole } from '../../types';
import * as S from './styled';

type UsersManagerProps = {
    users: ManagedUser[];
    permissionResources: PermissionResource[];
    permissionActions: PermissionAction[];
};

type UserFormData = {
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, 'owner'>;
    permissions: string[];
    export: boolean;
};

const emptyForm: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    permissions: [],
    export: false,
};

export default function UsersManager({ users, permissionResources, permissionActions }: UsersManagerProps) {
    const { t } = useI18n();
    const [createOpen, setCreateOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<ManagedUser | null>(null);
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
    const form = useForm<UserFormData>(emptyForm);
    const editForm = useForm<UserFormData>(emptyForm);

    function openEdit(user: ManagedUser) {
        setUserToEdit(user);
        editForm.clearErrors();
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role === 'admin' ? 'admin' : 'user',
            permissions: user.permissions.filter((permission) => permission !== 'export' && permission !== 'users.manage'),
            export: user.permissions.includes('export'),
        });
    }

    function closeCreate() {
        setCreateOpen(false);
        form.clearErrors();
        form.reset();
    }

    function closeEdit() {
        setUserToEdit(null);
        editForm.clearErrors();
        editForm.reset();
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/users', {
            onSuccess: closeCreate,
        });
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!userToEdit) {
            return;
        }

        editForm.put(`/users/${userToEdit.id}`, {
            onSuccess: closeEdit,
        });
    }

    function togglePermission(targetForm: typeof form | typeof editForm, permission: string) {
        const [resource, action] = permission.split('.', 2);
        const currentPermissions = targetForm.data.permissions.filter((current) => !current.endsWith('.delete'));
        const selected = currentPermissions.includes(permission);
        let nextPermissions = selected
            ? currentPermissions.filter((current) => current !== permission)
            : [...currentPermissions, permission];

        if (!selected && action === 'update') {
            nextPermissions = Array.from(new Set([...nextPermissions, `${resource}.read`]));
        }

        if (selected && action === 'read' && currentPermissions.includes(`${resource}.update`)) {
            nextPermissions = currentPermissions;
        }

        targetForm.setData(
            'permissions',
            nextPermissions,
        );
    }

    function deleteUser() {
        if (!userToDelete) {
            return;
        }

        router.delete(`/users/${userToDelete.id}`, {
            onSuccess: () => setUserToDelete(null),
        });
    }

    useEffect(() => {
        if (!createOpen && !userToEdit) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeCreate();
                closeEdit();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, userToEdit]);

    return (
        <S.Container>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>{t('users.title')}</S.ToolbarTitle>
                    <S.ToolbarDescription>{t('users.description')}</S.ToolbarDescription>
                </div>
                <S.Button type="button" onClick={() => setCreateOpen(true)}>
                    {t('users.add')}
                </S.Button>
            </S.Toolbar>

            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            <S.Th>{t('users.name')}</S.Th>
                            <S.Th>{t('users.role')}</S.Th>
                            <S.Th>{t('users.permissions')}</S.Th>
                            <S.Th>{t('common.actions')}</S.Th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <S.Td>
                                    <strong>{user.name}</strong>
                                    <br />
                                    {user.email}
                                </S.Td>
                                <S.Td>
                                    <S.Badge>{t(roleLabel(user.role))}</S.Badge>
                                </S.Td>
                                <S.Td>
                                    <S.PermissionList>
                                        {user.role === 'admin' || user.role === 'owner' ? (
                                            <S.PermissionChip>{t('users.allPermissions')}</S.PermissionChip>
                                        ) : user.permissions.length > 0 ? (
                                            user.permissions.map((permission) => (
                                                <S.PermissionChip key={permission}>{permission}</S.PermissionChip>
                                            ))
                                        ) : (
                                            <span>{t('common.none')}</span>
                                        )}
                                    </S.PermissionList>
                                </S.Td>
                                <S.Td>
                                    <S.RowActions>
                                        <S.SecondaryButton type="button" disabled={user.is_owner} onClick={() => openEdit(user)}>
                                            {t('common.edit')}
                                        </S.SecondaryButton>
                                        <S.DangerButton type="button" disabled={user.is_owner} onClick={() => setUserToDelete(user)}>
                                            {t('common.delete')}
                                        </S.DangerButton>
                                    </S.RowActions>
                                </S.Td>
                            </tr>
                        ))}
                    </tbody>
                </S.Table>
            </S.TableCard>

            {createOpen ? (
                <UserDialog
                    title={t('users.addTitle')}
                    description={t('users.addDescription')}
                    form={form}
                    permissionResources={permissionResources}
                    permissionActions={permissionActions}
                    onClose={closeCreate}
                    onSubmit={submit}
                    togglePermission={togglePermission}
                    passwordRequired
                />
            ) : null}

            {userToEdit ? (
                <UserDialog
                    title={t('users.editTitle')}
                    description={t('users.editDescription')}
                    form={editForm}
                    permissionResources={permissionResources}
                    permissionActions={permissionActions}
                    onClose={closeEdit}
                    onSubmit={submitEdit}
                    togglePermission={togglePermission}
                />
            ) : null}

            <ConfirmModal
                open={Boolean(userToDelete)}
                title={t('users.deleteTitle')}
                description={t('users.deleteDescription', { name: userToDelete?.name ?? '' })}
                onClose={() => setUserToDelete(null)}
                onConfirm={deleteUser}
            />
        </S.Container>
    );
}

type UserDialogProps = {
    title: string;
    description: string;
    form: ReturnType<typeof useForm<UserFormData>>;
    permissionResources: PermissionResource[];
    permissionActions: PermissionAction[];
    passwordRequired?: boolean;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    togglePermission: (form: ReturnType<typeof useForm<UserFormData>>, permission: string) => void;
};

function UserDialog({
    title,
    description,
    form,
    permissionResources,
    permissionActions,
    passwordRequired = false,
    onClose,
    onSubmit,
    togglePermission,
}: UserDialogProps) {
    const { t } = useI18n();
    const permissionsDisabled = form.data.role === 'admin';

    return (
        <S.Overlay onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <S.Dialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <S.DialogTitle>{title}</S.DialogTitle>
                <S.DialogDescription>{description}</S.DialogDescription>
                <S.Form onSubmit={onSubmit}>
                    <FormField label={t('users.name')} error={form.errors.name}>
                        <S.Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </FormField>
                    <FormField label={t('users.email')} error={form.errors.email}>
                        <S.Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                    </FormField>
                    <FormField label={t('users.password')} error={form.errors.password}>
                        <S.Input
                            type="password"
                            placeholder={passwordRequired ? undefined : t('users.passwordPlaceholder')}
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                        />
                    </FormField>
                    <FormField label={t('users.role')} error={form.errors.role}>
                        <S.Select value={form.data.role} onChange={(event) => form.setData('role', event.target.value as UserFormData['role'])}>
                            <option value="user">{t('users.roleUser')}</option>
                            <option value="admin">{t('users.roleAdmin')}</option>
                        </S.Select>
                    </FormField>
                    <S.Full>
                        <S.PermissionMatrix>
                            <S.MatrixHeader>
                                <span>{t('users.resource')}</span>
                                {permissionActions.map((action) => (
                                    <span key={action}>{t(permissionActionLabel(action))}</span>
                                ))}
                            </S.MatrixHeader>
                            {permissionResources.map((resource) => (
                                <S.MatrixRow key={resource}>
                                    <strong>{t(permissionResourceLabel(resource))}</strong>
                                    {permissionActions.map((action) => {
                                        const permission = `${resource}.${action}`;
                                        const updatePermission = `${resource}.update`;
                                        const updateSelected = form.data.permissions.includes(updatePermission);
                                        const checked = form.data.permissions.includes(permission)
                                            || (action === 'read' && updateSelected);
                                        const disabled = permissionsDisabled || (action === 'read' && updateSelected);

                                        return (
                                            <S.CheckboxLabel key={permission}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    disabled={disabled}
                                                    onChange={() => togglePermission(form, permission)}
                                                />
                                                <span>{t(permissionActionLabel(action))}</span>
                                            </S.CheckboxLabel>
                                        );
                                    })}
                                </S.MatrixRow>
                            ))}
                            <S.MatrixRow>
                                <strong>{t('users.exportPermission')}</strong>
                                <span aria-hidden="true" />
                                <S.CheckboxLabel>
                                    <input
                                        type="checkbox"
                                        checked={form.data.export}
                                        disabled={permissionsDisabled}
                                        onChange={(event) => form.setData('export', event.target.checked)}
                                    />
                                    <span>{t('users.action.update')}</span>
                                </S.CheckboxLabel>
                            </S.MatrixRow>
                        </S.PermissionMatrix>
                    </S.Full>
                    <S.Full>
                        <S.DialogActions>
                            <S.SecondaryButton type="button" onClick={onClose}>
                                {t('common.cancel')}
                            </S.SecondaryButton>
                            <S.Button type="submit" disabled={form.processing}>
                                {t('common.save')}
                            </S.Button>
                        </S.DialogActions>
                    </S.Full>
                </S.Form>
            </S.Dialog>
        </S.Overlay>
    );
}

function roleLabel(role: UserRole): TranslationKey {
    if (role === 'owner') {
        return 'users.roleOwner';
    }

    return role === 'admin' ? 'users.roleAdmin' : 'users.roleUser';
}

function permissionResourceLabel(resource: PermissionResource): TranslationKey {
    return `users.resource.${resource}` as TranslationKey;
}

function permissionActionLabel(action: PermissionAction): TranslationKey {
    return `users.action.${action}` as TranslationKey;
}
