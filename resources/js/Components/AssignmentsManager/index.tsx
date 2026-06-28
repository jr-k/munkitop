import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import PackageIcon from '../PackageIcon';
import TableIcon from '../TableIcon';
import TargetIcon from '../TargetIcon';
import { useI18n } from '../../i18n';
import { Assignment, Group, Package, Person } from '../../types';
import * as S from './styled';

type AssignmentsManagerProps = {
    assignments: Assignment[];
    groups: Group[];
    packages: Package[];
    people: Person[];
};

export default function AssignmentsManager({ assignments, groups, packages, people }: AssignmentsManagerProps) {
    const { t } = useI18n();
    const [createOpen, setCreateOpen] = useState(false);
    const [packageDropdownOpen, setPackageDropdownOpen] = useState(false);
    const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
    const [packageSearch, setPackageSearch] = useState('');
    const [targetSearch, setTargetSearch] = useState('');
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [targetFilter, setTargetFilter] = useState('all');
    const form = useForm({
        package_id: '',
        target: '',
        target_type: 'group',
        target_id: '',
        action: 'install',
    });

    function closeCreateModal() {
        setCreateOpen(false);
        setPackageDropdownOpen(false);
        setTargetDropdownOpen(false);
        setPackageSearch('');
        setTargetSearch('');
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const [targetType, targetId] = form.data.target.split(':');

        form.transform((data) => ({
            package_id: data.package_id,
            target_type: targetType,
            target_id: targetId,
            action: data.action,
        })).post('/assignments', {
            onSuccess: () => {
                form.reset();
                closeCreateModal();
            },
        });
    }

    function personLabel(person: Person) {
        return [person.first_name, person.name].filter(Boolean).join(' ');
    }

    const targetOptions = [
        ...groups.map((group) => ({
            id: `group:${group.id}`,
            label: group.name,
            eyebrow: t('common.group'),
            type: 'group' as const,
        })),
        ...people.map((person) => ({
            id: `person:${person.id}`,
            label: personLabel(person),
            eyebrow: t('common.person'),
            type: 'person' as const,
        })),
    ];
    const selectedPackage = packages.find((pkg) => String(pkg.id) === form.data.package_id);
    const selectedTarget = targetOptions.find((target) => target.id === form.data.target);
    const filteredPackages = packages.filter((pkg) =>
        [pkg.display_name, pkg.munki_name].join(' ').toLowerCase().includes(packageSearch.trim().toLowerCase()),
    );
    const filteredTargets = targetOptions.filter((target) =>
        [target.eyebrow, target.label].join(' ').toLowerCase().includes(targetSearch.trim().toLowerCase()),
    );

    const normalizedSearch = search.trim().toLowerCase();
    const filteredAssignments = assignments.filter((assignment) => {
        const searchable = [
            assignment.package.name ?? '',
            assignment.package.munki_name ?? '',
            assignment.target.name ?? '',
            assignment.target.type,
            assignment.action,
        ]
            .join(' ')
            .toLowerCase();

        return (
            (!normalizedSearch || searchable.includes(normalizedSearch)) &&
            (actionFilter === 'all' || actionFilter === assignment.action) &&
            (targetFilter === 'all' || targetFilter === assignment.target.type)
        );
    });

    useEffect(() => {
        if (!createOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeCreateModal();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen]);

    return (
        <S.AssignmentsManagerContainer>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>{t('common.assignments')}</S.ToolbarTitle>
                    <S.ToolbarDescription>{t('assignments.description')}</S.ToolbarDescription>
                </div>
                <S.Button type="button" onClick={() => setCreateOpen(true)}>
                    {t('common.add')}
                </S.Button>
            </S.Toolbar>

            {createOpen ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCreateModal();
                        }
                    }}
                >
                    <S.Dialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('assignments.addTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('assignments.addDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={closeCreateModal} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submit}>
                            <FormField label={t('assignments.package')} error={form.errors.package_id}>
                                <S.SearchDropdown>
                                    <S.DropdownTrigger
                                        type="button"
                                        onClick={() => {
                                            setPackageDropdownOpen((open) => !open);
                                            setTargetDropdownOpen(false);
                                        }}
                                    >
                                        {selectedPackage ? (
                                            <S.PackageOption>
                                                <PackageIcon iconUrl={selectedPackage.icon_url} name={selectedPackage.display_name} />
                                                <span>
                                                    <S.OptionEyebrow>{selectedPackage.munki_name}</S.OptionEyebrow>
                                                    <S.OptionLabel>{selectedPackage.display_name}</S.OptionLabel>
                                                </span>
                                            </S.PackageOption>
                                        ) : (
                                            <S.Placeholder>{t('assignments.choosePackage')}</S.Placeholder>
                                        )}
                                        <S.Caret aria-hidden="true">▾</S.Caret>
                                    </S.DropdownTrigger>
                                    {packageDropdownOpen ? (
                                        <S.DropdownPanel>
                                            <S.DropdownSearch
                                                value={packageSearch}
                                                onChange={(event) => setPackageSearch(event.target.value)}
                                                placeholder={t('assignments.searchPackage')}
                                                autoFocus
                                            />
                                            <S.DropdownList>
                                                {filteredPackages.length === 0 ? (
                                                    <S.EmptyOption>{t('assignments.noPackage')}</S.EmptyOption>
                                                ) : (
                                                    filteredPackages.map((pkg) => (
                                                        <S.DropdownOption
                                                            key={pkg.id}
                                                            type="button"
                                                            $selected={String(pkg.id) === form.data.package_id}
                                                            onClick={() => {
                                                                form.setData('package_id', String(pkg.id));
                                                                setPackageDropdownOpen(false);
                                                                setPackageSearch('');
                                                            }}
                                                        >
                                                            <S.PackageOption>
                                                                <PackageIcon iconUrl={pkg.icon_url} name={pkg.display_name} />
                                                                <span>
                                                                    <S.OptionEyebrow>{pkg.munki_name}</S.OptionEyebrow>
                                                                    <S.OptionLabel>{pkg.display_name}</S.OptionLabel>
                                                                </span>
                                                            </S.PackageOption>
                                                            {String(pkg.id) === form.data.package_id ? <span aria-hidden="true">✓</span> : null}
                                                        </S.DropdownOption>
                                                    ))
                                                )}
                                            </S.DropdownList>
                                        </S.DropdownPanel>
                                    ) : null}
                                </S.SearchDropdown>
                            </FormField>
                            <FormField label={t('assignments.target')} error={form.errors.target_id}>
                                <S.SearchDropdown>
                                    <S.DropdownTrigger
                                        type="button"
                                        onClick={() => {
                                            setTargetDropdownOpen((open) => !open);
                                            setPackageDropdownOpen(false);
                                        }}
                                    >
                                        {selectedTarget ? (
                                            <S.TargetOption>
                                                <TargetIcon type={selectedTarget.type} />
                                                <span>
                                                    <S.OptionEyebrow>{selectedTarget.eyebrow}</S.OptionEyebrow>
                                                    <S.OptionLabel>{selectedTarget.label}</S.OptionLabel>
                                                </span>
                                            </S.TargetOption>
                                        ) : (
                                            <S.Placeholder>{t('assignments.chooseTarget')}</S.Placeholder>
                                        )}
                                        <S.Caret aria-hidden="true">▾</S.Caret>
                                    </S.DropdownTrigger>
                                    {targetDropdownOpen ? (
                                        <S.DropdownPanel>
                                            <S.DropdownSearch
                                                value={targetSearch}
                                                onChange={(event) => setTargetSearch(event.target.value)}
                                                placeholder={t('assignments.searchTarget')}
                                                autoFocus
                                            />
                                            <S.DropdownList>
                                                {filteredTargets.length === 0 ? (
                                                    <S.EmptyOption>{t('assignments.noTarget')}</S.EmptyOption>
                                                ) : (
                                                    filteredTargets.map((target) => (
                                                        <S.DropdownOption
                                                            key={target.id}
                                                            type="button"
                                                            $selected={target.id === form.data.target}
                                                            onClick={() => {
                                                                form.setData('target', target.id);
                                                                setTargetDropdownOpen(false);
                                                                setTargetSearch('');
                                                            }}
                                                        >
                                                            <S.TargetOption>
                                                                <TargetIcon type={target.type} />
                                                                <span>
                                                                    <S.OptionEyebrow>{target.eyebrow}</S.OptionEyebrow>
                                                                    <S.OptionLabel>{target.label}</S.OptionLabel>
                                                                </span>
                                                            </S.TargetOption>
                                                            {target.id === form.data.target ? <span aria-hidden="true">✓</span> : null}
                                                        </S.DropdownOption>
                                                    ))
                                                )}
                                            </S.DropdownList>
                                        </S.DropdownPanel>
                                    ) : null}
                                </S.SearchDropdown>
                            </FormField>
                            <FormField label={t('assignments.action')} error={form.errors.action}>
                                <S.ActionChoice>
                                    <S.ActionChoiceButton
                                        type="button"
                                        $active={form.data.action === 'install'}
                                        $action="install"
                                        onClick={() => form.setData('action', 'install')}
                                    >
                                        {t('assignments.install')}
                                    </S.ActionChoiceButton>
                                    <S.ActionChoiceButton
                                        type="button"
                                        $active={form.data.action === 'uninstall'}
                                        $action="uninstall"
                                        onClick={() => form.setData('action', 'uninstall')}
                                    >
                                        {t('assignments.uninstall')}
                                    </S.ActionChoiceButton>
                                </S.ActionChoice>
                            </FormField>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={closeCreateModal}>
                                    {t('common.cancel')}
                                </S.SecondaryButton>
                                <S.Button type="submit" disabled={form.processing}>
                                    {t('assignments.assign')}
                                </S.Button>
                            </S.ModalActions>
                        </S.Form>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}

            <S.FilterBar>
                <div>
                    <S.FilterTitle>{t('assignments.listTitle')}</S.FilterTitle>
                    <S.FilterMeta>{t('people.displayed', { count: filteredAssignments.length })}</S.FilterMeta>
                </div>
                <S.FilterControls>
                    <S.FilterControl>
                        <span>{t('common.search')}</span>
                        <S.FilterInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('assignments.searchPlaceholder')}
                        />
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>Action</span>
                        <S.FilterSelect value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
                            <option value="all">{t('assignments.allActions')}</option>
                            <option value="install">{t('assignments.install')}</option>
                            <option value="uninstall">{t('assignments.uninstall')}</option>
                        </S.FilterSelect>
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>{t('assignments.target')}</span>
                        <S.FilterSelect value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)}>
                            <option value="all">{t('assignments.allTargets')}</option>
                            <option value="group">{t('common.groups')}</option>
                            <option value="person">{t('common.people')}</option>
                        </S.FilterSelect>
                    </S.FilterControl>
                </S.FilterControls>
            </S.FilterBar>

            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            <th>{t('assignments.package')}</th>
                            <th>{t('packages.munkiName')}</th>
                            <th>{t('assignments.action')}</th>
                            <th>{t('assignments.targetType')}</th>
                            <th>{t('assignments.target')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={6}>{t('assignments.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            filteredAssignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td>
                                        <S.PackageTitle>
                                            <PackageIcon iconUrl={assignment.package.icon_url} name={assignment.package.name ?? ''} />
                                            <S.PrimaryCell>{assignment.package.name}</S.PrimaryCell>
                                        </S.PackageTitle>
                                    </td>
                                    <td>{assignment.package.munki_name ?? '-'}</td>
                                    <td>
                                        <S.ActionBadge $action={assignment.action}>
                                            {assignment.action === 'install' ? t('assignments.install') : t('assignments.uninstall')}
                                        </S.ActionBadge>
                                    </td>
                                    <td>{assignment.target.type === 'group' ? t('common.group') : t('common.person')}</td>
                                    <td>
                                        <S.TargetTitle>
                                            <TargetIcon type={assignment.target.type} />
                                            {assignment.target.name}
                                        </S.TargetTitle>
                                    </td>
                                    <td>
                                        <S.TableIconButton
                                            type="button"
                                            $tone="danger"
                                            aria-label={t('common.delete')}
                                            title={t('common.delete')}
                                            onClick={() => setAssignmentToDelete(assignment)}
                                        >
                                            <TableIcon name="delete" />
                                        </S.TableIconButton>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </S.Table>
            </S.TableCard>
            <ConfirmModal
                open={assignmentToDelete !== null}
                title={t('assignments.deleteTitle')}
                description={
                    assignmentToDelete
                        ? t('assignments.deleteDescription', {
                            package: assignmentToDelete.package.name ?? t('assignments.package'),
                            target: assignmentToDelete.target.name ?? t('assignments.target'),
                        })
                        : ''
                }
                onClose={() => setAssignmentToDelete(null)}
                onConfirm={() => {
                    if (!assignmentToDelete) {
                        return;
                    }

                    router.delete(`/assignments/${assignmentToDelete.id}`, {
                        onFinish: () => setAssignmentToDelete(null),
                    });
                }}
            />
        </S.AssignmentsManagerContainer>
    );
}
