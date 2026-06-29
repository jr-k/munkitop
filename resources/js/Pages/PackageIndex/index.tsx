import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import FlashMessage from '../../Components/FlashMessage';
import FormField from '../../Components/FormField';
import PackageIcon from '../../Components/PackageIcon';
import { useI18n } from '../../i18n';
import { PageProps } from '../../types';
import * as S from './styled';

type FilterOption = {
    id: number;
    name: string;
    first_name?: string | null;
    slug?: string;
    email?: string;
    client_identifier?: string;
};

type PackageResult = {
    id: number;
    munki_name: string;
    display_name: string;
    icon_url: string | null;
    pkg_path: string | null;
    pkg_url: string | null;
    hash: string;
    active: boolean;
    assignments_count: number;
    assignments: {
        id: number;
        action: 'install' | 'uninstall';
        target: {
            id: number | null;
            type: 'person' | 'group';
            name: string | null;
        };
    }[];
};

type Filters = {
    search: string;
    group_id: string;
    person_id: string;
    source: string;
    active: string;
    action: string;
};

type PackageIndexProps = PageProps & {
    packages: PackageResult[];
    groups: FilterOption[];
    people: FilterOption[];
    filters: Filters;
};

export default function PackageIndex({ packages, groups, people, filters }: PackageIndexProps) {
    const { props } = usePage<PackageIndexProps>();
    const { t } = useI18n();
    const [values, setValues] = useState<Filters>(filters);
    const adminEmail = props.auth.user?.email ?? 'admin';

    function setFilter(key: keyof Filters, value: string) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get('/packages', values, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function personLabel(person: FilterOption) {
        return [person.first_name, person.name].filter(Boolean).join(' ');
    }

    return (
        <S.PackageIndexContainer>
            <Head title={t('common.packages')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />

                <S.Heading>
                    <S.Title>Packages</S.Title>
                    <S.Description>
                        {t('packageIndex.description')}
                    </S.Description>
                </S.Heading>

                <S.Filters onSubmit={submit}>
                    <FormField label={t('packageIndex.name')}>
                        <S.Input
                            value={values.search}
                            onChange={(event) => setFilter('search', event.target.value)}
                            placeholder="Chrome, Slack, Docker..."
                        />
                    </FormField>
                    <FormField label={t('common.group')}>
                        <S.Select value={values.group_id} onChange={(event) => setFilter('group_id', event.target.value)}>
                            <option value="">{t('common.all')}</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </S.Select>
                    </FormField>
                    <FormField label={t('common.person')}>
                        <S.Select
                            value={values.person_id}
                            onChange={(event) => setFilter('person_id', event.target.value)}
                        >
                            <option value="">{t('common.all')}</option>
                            {people.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {personLabel(person)}
                                </option>
                            ))}
                        </S.Select>
                    </FormField>
                    <FormField label={t('packages.source')}>
                        <S.Select value={values.source} onChange={(event) => setFilter('source', event.target.value)}>
                            <option value="">{t('packages.allSources')}</option>
                            <option value="uploaded">{t('packages.sourceUploaded')}</option>
                            <option value="remote">{t('packages.sourceRemote')}</option>
                        </S.Select>
                    </FormField>
                    <FormField label={t('packages.status')}>
                        <S.Select value={values.active} onChange={(event) => setFilter('active', event.target.value)}>
                            <option value="">{t('packages.allStatuses')}</option>
                            <option value="active">{t('packages.activeStatus')}</option>
                            <option value="inactive">{t('packages.inactiveStatus')}</option>
                        </S.Select>
                    </FormField>
                    <FormField label={t('assignments.action')}>
                        <S.Select value={values.action} onChange={(event) => setFilter('action', event.target.value)}>
                            <option value="">{t('assignments.allActions')}</option>
                            <option value="install">{t('assignments.install')}</option>
                            <option value="uninstall">{t('assignments.uninstall')}</option>
                        </S.Select>
                    </FormField>
                    <S.Button type="submit">{t('packageIndex.filter')}</S.Button>
                </S.Filters>

                <S.Results>
                    {packages.length === 0 ? (
                        <S.Empty>{t('packages.noMatch')}</S.Empty>
                    ) : (
                        packages.map((pkg) => (
                            <S.PackageCard key={pkg.id}>
                                <S.PackageHeader>
                                    <S.PackageIdentity>
                                        <PackageIcon iconUrl={pkg.icon_url} name={pkg.display_name} />
                                        <div>
                                            <S.PackageTitle>{pkg.display_name}</S.PackageTitle>
                                            <S.Meta>
                                                {pkg.munki_name} · {pkg.pkg_path ? t('packages.sourceUploaded') : t('packages.sourceRemote')} ·{' '}
                                                {pkg.active ? t('packages.activeStatus') : t('packages.inactiveStatus')}
                                            </S.Meta>
                                        </div>
                                    </S.PackageIdentity>
                                    <S.Badges>
                                        <S.Badge>{t('packageIndex.assignmentCount', { count: pkg.assignments_count })}</S.Badge>
                                        <S.Badge>{pkg.pkg_path ? 'pkgs/' : pkg.pkg_url}</S.Badge>
                                    </S.Badges>
                                </S.PackageHeader>

                                <S.Meta>Hash: {pkg.hash}</S.Meta>

                                <S.AssignmentList>
                                    {pkg.assignments.length === 0 ? (
                                        <S.Meta>{t('packageIndex.noAssignment')}</S.Meta>
                                    ) : (
                                        pkg.assignments.map((assignment) => (
                                            <S.Badge key={assignment.id}>
                                                {assignment.action === 'install' ? t('assignments.install') : t('assignments.uninstall')} ·{' '}
                                                {assignment.target.type === 'group' ? t('common.group') : t('common.person')} ·{' '}
                                                {assignment.target.name}
                                            </S.Badge>
                                        ))
                                    )}
                                </S.AssignmentList>
                            </S.PackageCard>
                        ))
                    )}
                </S.Results>
            </AppLayout>
        </S.PackageIndexContainer>
    );
}
