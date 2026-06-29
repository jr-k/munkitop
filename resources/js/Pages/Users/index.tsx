import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import FlashMessage from '../../Components/FlashMessage';
import UsersManager from '../../Components/UsersManager';
import { useI18n } from '../../i18n';
import { ManagedUser, PageProps, PermissionAction, PermissionResource } from '../../types';

type UsersPageProps = PageProps & {
    users: ManagedUser[];
    permissionResources: PermissionResource[];
    permissionActions: PermissionAction[];
};

export default function Users({ users, permissionResources, permissionActions }: UsersPageProps) {
    const { props } = usePage<UsersPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.user?.email ?? 'admin';

    return (
        <>
            <Head title={t('common.users')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <UsersManager users={users} permissionResources={permissionResources} permissionActions={permissionActions} />
            </AppLayout>
        </>
    );
}
