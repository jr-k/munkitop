import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import FlashMessage from '../../Components/FlashMessage';
import GroupsManager from '../../Components/GroupsManager';
import { useI18n } from '../../i18n';
import { Group, PageProps, Person } from '../../types';

type GroupsPageProps = PageProps & {
    groups: Group[];
    people: Person[];
};

export default function Groups({ groups, people }: GroupsPageProps) {
    const { props } = usePage<GroupsPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.user?.email ?? 'admin';

    return (
        <>
            <Head title={t('common.groups')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <GroupsManager groups={groups} people={people} />
            </AppLayout>
        </>
    );
}
