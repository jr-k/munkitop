import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import FlashMessage from '../../Components/FlashMessage';
import PeopleManager from '../../Components/PeopleManager';
import { useI18n } from '../../i18n';
import { Group, PageProps, Person } from '../../types';

type PeoplePageProps = PageProps & {
    people: Person[];
    groups: Group[];
};

export default function People({ people, groups }: PeoplePageProps) {
    const { props } = usePage<PeoplePageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.admin?.email ?? 'admin';

    return (
        <>
            <Head title={t('common.people')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <PeopleManager people={people} groups={groups} />
            </AppLayout>
        </>
    );
}
