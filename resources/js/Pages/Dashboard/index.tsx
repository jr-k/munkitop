import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import AssignmentsManager from '../../Components/AssignmentsManager';
import ExportPanel from '../../Components/ExportPanel';
import FlashMessage from '../../Components/FlashMessage';
import GroupsManager from '../../Components/GroupsManager';
import PackagesManager from '../../Components/PackagesManager';
import PeopleManager from '../../Components/PeopleManager';
import { useI18n } from '../../i18n';
import { Assignment, Group, Package, PageProps, Person } from '../../types';
import * as S from './styled';

type DashboardProps = PageProps & {
    people: Person[];
    groups: Group[];
    packages: Package[];
    assignments: Assignment[];
    munki: {
        repoPath: string;
        repoUrl: string;
        externalUrl: {
            override: boolean;
            url: string;
            defaultUrl: string;
        };
        catalog: string;
        baseManifest: string;
    };
};

export default function Dashboard({ people, groups, packages, assignments, munki }: DashboardProps) {
    const { props } = usePage<DashboardProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.admin?.email ?? 'admin';

    return (
        <S.DashboardContainer>
            <Head title={t('common.people')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <ExportPanel munki={munki} />
                <S.Grid>
                    <GroupsManager groups={groups} />
                    <PeopleManager people={people} groups={groups} />
                    <PackagesManager packages={packages} />
                    <S.Wide>
                        <AssignmentsManager
                            assignments={assignments}
                            groups={groups}
                            packages={packages}
                            people={people}
                        />
                    </S.Wide>
                </S.Grid>
            </AppLayout>
        </S.DashboardContainer>
    );
}
