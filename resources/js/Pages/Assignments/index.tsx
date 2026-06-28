import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import AssignmentsManager from '../../Components/AssignmentsManager';
import FlashMessage from '../../Components/FlashMessage';
import { useI18n } from '../../i18n';
import { Assignment, Group, Package, PageProps, Person } from '../../types';

type AssignmentsPageProps = PageProps & {
    assignments: Assignment[];
    groups: Group[];
    packages: Package[];
    people: Person[];
};

export default function Assignments({ assignments, groups, packages, people }: AssignmentsPageProps) {
    const { props } = usePage<AssignmentsPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.admin?.email ?? 'admin';

    return (
        <>
            <Head title={t('common.assignments')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <AssignmentsManager assignments={assignments} groups={groups} packages={packages} people={people} />
            </AppLayout>
        </>
    );
}
