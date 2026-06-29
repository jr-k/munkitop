import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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

type AssignmentFormData = {
    package_ids: string[];
    targets: string[];
    action: 'install' | 'uninstall';
};

type SortDirection = 'asc' | 'desc';
type AssignmentSortKey = 'package' | 'munki_name' | 'action' | 'target_type' | 'target';

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
    const [targetFilterOpen, setTargetFilterOpen] = useState(false);
    const [targetFilterSearch, setTargetFilterSearch] = useState('');
    const [selectedFilterTargetIds, setSelectedFilterTargetIds] = useState<string[]>([]);
    const [sort, setSort] = useState<{ key: AssignmentSortKey; direction: SortDirection }>({
        key: 'package',
        direction: 'asc',
    });
    const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const packageDropdownRef = useRef<HTMLDivElement | null>(null);
    const targetDropdownRef = useRef<HTMLDivElement | null>(null);
    const targetFilterDropdownRef = useRef<HTMLDivElement | null>(null);
    const form = useForm<AssignmentFormData>({
        package_ids: [],
        targets: [],
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

        form.post('/assignments', {
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
    const selectedPackages = packages.filter((pkg) => form.data.package_ids.includes(String(pkg.id)));
    const selectedTargets = targetOptions.filter((target) => form.data.targets.includes(target.id));
    const selectedFilterTargets = targetOptions.filter((target) => selectedFilterTargetIds.includes(target.id));
    const filteredFilterTargets = targetOptions.filter((target) =>
        [target.eyebrow, target.label].join(' ').toLowerCase().includes(targetFilterSearch.trim().toLowerCase()),
    );
    const filteredPackages = packages.filter((pkg) =>
        [pkg.display_name, pkg.munki_name].join(' ').toLowerCase().includes(packageSearch.trim().toLowerCase()),
    );
    const filteredTargets = targetOptions.filter((target) =>
        [target.eyebrow, target.label].join(' ').toLowerCase().includes(targetSearch.trim().toLowerCase()),
    );

    function togglePackage(packageId: string) {
        form.setData(
            'package_ids',
            form.data.package_ids.includes(packageId)
                ? form.data.package_ids.filter((id) => id !== packageId)
                : [...form.data.package_ids, packageId],
        );
    }

    function toggleTarget(targetId: string) {
        form.setData(
            'targets',
            form.data.targets.includes(targetId)
                ? form.data.targets.filter((id) => id !== targetId)
                : [...form.data.targets, targetId],
        );
    }

    function toggleFilterTarget(targetId: string) {
        setSelectedFilterTargetIds((current) =>
            current.includes(targetId)
                ? current.filter((selectedId) => selectedId !== targetId)
                : [...current, targetId],
        );
    }

    const normalizedSearch = search.trim().toLowerCase();
    const filteredAssignments = assignments
        .filter((assignment) => {
            const searchable = [
                assignment.package.name ?? '',
                assignment.package.munki_name ?? '',
                assignment.target.name ?? '',
                assignment.target.type,
                assignment.action,
            ]
                .join(' ')
                .toLowerCase();

            if (normalizedSearch && !searchable.includes(normalizedSearch)) {
                return false;
            }

            if (actionFilter !== 'all' && actionFilter !== assignment.action) {
                return false;
            }

            if (selectedFilterTargetIds.length === 0) {
                return true;
            }

            return assignment.target.id !== null
                && selectedFilterTargetIds.includes(`${assignment.target.type}:${assignment.target.id}`);
        })
        .sort((firstAssignment, secondAssignment) => {
            const comparison = String(sortValue(firstAssignment, sort.key)).localeCompare(
                String(sortValue(secondAssignment, sort.key)),
                undefined,
                { numeric: true, sensitivity: 'base' },
            );

            if (comparison !== 0) {
                return sort.direction === 'asc' ? comparison : -comparison;
            }

            return (firstAssignment.package.name ?? '').localeCompare(secondAssignment.package.name ?? '', undefined, {
                sensitivity: 'base',
            });
        });

    function sortValue(assignment: Assignment, key: AssignmentSortKey) {
        if (key === 'package') {
            return assignment.package.name ?? '';
        }

        if (key === 'munki_name') {
            return assignment.package.munki_name ?? '';
        }

        if (key === 'target_type') {
            return assignment.target.type === 'group' ? t('common.group') : t('common.person');
        }

        if (key === 'target') {
            return assignment.target.name ?? '';
        }

        return assignment.action === 'install' ? t('assignments.install') : t('assignments.uninstall');
    }

    function changeSort(key: AssignmentSortKey) {
        setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    function sortIndicator(key: AssignmentSortKey) {
        if (sort.key !== key) {
            return '';
        }

        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    const visibleAssignmentIds = filteredAssignments.map((assignment) => assignment.id);
    const allVisibleAssignmentsSelected = visibleAssignmentIds.length > 0
        && visibleAssignmentIds.every((id) => selectedAssignmentIds.includes(id));

    function toggleAssignmentSelection(assignmentId: number) {
        setSelectedAssignmentIds((current) =>
            current.includes(assignmentId)
                ? current.filter((id) => id !== assignmentId)
                : [...current, assignmentId],
        );
    }

    function toggleVisibleAssignmentsSelection() {
        setSelectedAssignmentIds((current) => {
            if (allVisibleAssignmentsSelected) {
                return current.filter((id) => !visibleAssignmentIds.includes(id));
            }

            return Array.from(new Set([...current, ...visibleAssignmentIds]));
        });
    }

    useEffect(() => {
        if (!createOpen && !targetFilterOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            if (packageDropdownOpen || targetDropdownOpen || targetFilterOpen) {
                setPackageDropdownOpen(false);
                setTargetDropdownOpen(false);
                setTargetFilterOpen(false);
                setPackageSearch('');
                setTargetSearch('');
                setTargetFilterSearch('');
                return;
            }

            if (createOpen) {
                closeCreateModal();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, packageDropdownOpen, targetDropdownOpen, targetFilterOpen]);

    useEffect(() => {
        if (!packageDropdownOpen && !targetDropdownOpen && !targetFilterOpen) {
            return;
        }

        function closeOnOutsideClick(event: MouseEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                packageDropdownRef.current?.contains(target)
                || targetDropdownRef.current?.contains(target)
                || targetFilterDropdownRef.current?.contains(target)
            ) {
                return;
            }

            setPackageDropdownOpen(false);
            setTargetDropdownOpen(false);
            setTargetFilterOpen(false);
            setTargetFilterSearch('');
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [packageDropdownOpen, targetDropdownOpen, targetFilterOpen]);

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
                            <S.FormGrid>
                                <FormField label={t('assignments.package')} error={form.errors.package_ids}>
                                    <S.SearchDropdown ref={packageDropdownRef}>
                                        <S.DropdownTrigger
                                            type="button"
                                            onClick={() => {
                                                setPackageDropdownOpen((open) => !open);
                                                setTargetDropdownOpen(false);
                                            }}
                                        >
                                            {selectedPackages.length > 0 ? (
                                                <S.SelectionSummary>
                                                    {selectedPackages.length === 1 ? (
                                                        <S.PackageOption>
                                                            <PackageIcon iconUrl={selectedPackages[0].icon_url} name={selectedPackages[0].display_name} />
                                                            <span>
                                                                <S.OptionEyebrow>{selectedPackages[0].munki_name}</S.OptionEyebrow>
                                                                <S.OptionLabel>{selectedPackages[0].display_name}</S.OptionLabel>
                                                            </span>
                                                        </S.PackageOption>
                                                    ) : (
                                                        <S.OptionLabel>{t('assignments.selectedPackages', { count: selectedPackages.length })}</S.OptionLabel>
                                                    )}
                                                </S.SelectionSummary>
                                            ) : (
                                                <S.Placeholder>{t('assignments.choosePackages')}</S.Placeholder>
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
                                                                $selected={form.data.package_ids.includes(String(pkg.id))}
                                                                onClick={() => {
                                                                    togglePackage(String(pkg.id));
                                                                }}
                                                            >
                                                                <S.PackageOption>
                                                                    <PackageIcon iconUrl={pkg.icon_url} name={pkg.display_name} />
                                                                    <span>
                                                                        <S.OptionEyebrow>{pkg.munki_name}</S.OptionEyebrow>
                                                                        <S.OptionLabel>{pkg.display_name}</S.OptionLabel>
                                                                    </span>
                                                                </S.PackageOption>
                                                                {form.data.package_ids.includes(String(pkg.id)) ? <span aria-hidden="true">✓</span> : null}
                                                            </S.DropdownOption>
                                                        ))
                                                    )}
                                                </S.DropdownList>
                                            </S.DropdownPanel>
                                        ) : null}
                                    </S.SearchDropdown>
                                </FormField>
                                <FormField label={t('assignments.target')} error={form.errors.targets}>
                                    <S.SearchDropdown ref={targetDropdownRef}>
                                        <S.DropdownTrigger
                                            type="button"
                                            onClick={() => {
                                                setTargetDropdownOpen((open) => !open);
                                                setPackageDropdownOpen(false);
                                            }}
                                        >
                                            {selectedTargets.length > 0 ? (
                                                <S.SelectionSummary>
                                                    {selectedTargets.length === 1 ? (
                                                        <S.TargetOption>
                                                            <TargetIcon type={selectedTargets[0].type} />
                                                            <span>
                                                                <S.OptionEyebrow>{selectedTargets[0].eyebrow}</S.OptionEyebrow>
                                                                <S.OptionLabel>{selectedTargets[0].label}</S.OptionLabel>
                                                            </span>
                                                        </S.TargetOption>
                                                    ) : (
                                                        <S.OptionLabel>{t('assignments.selectedTargets', { count: selectedTargets.length })}</S.OptionLabel>
                                                    )}
                                                </S.SelectionSummary>
                                            ) : (
                                                <S.Placeholder>{t('assignments.chooseTargets')}</S.Placeholder>
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
                                                                $selected={form.data.targets.includes(target.id)}
                                                                onClick={() => {
                                                                    toggleTarget(target.id);
                                                                }}
                                                            >
                                                                <S.TargetOption>
                                                                    <TargetIcon type={target.type} />
                                                                    <span>
                                                                        <S.OptionEyebrow>{target.eyebrow}</S.OptionEyebrow>
                                                                        <S.OptionLabel>{target.label}</S.OptionLabel>
                                                                    </span>
                                                                </S.TargetOption>
                                                                {form.data.targets.includes(target.id) ? <span aria-hidden="true">✓</span> : null}
                                                            </S.DropdownOption>
                                                        ))
                                                    )}
                                                </S.DropdownList>
                                            </S.DropdownPanel>
                                        ) : null}
                                    </S.SearchDropdown>
                                </FormField>
                            </S.FormGrid>
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
                    {selectedAssignmentIds.length > 0 ? (
                        <S.DangerButton type="button" onClick={() => setBulkDeleteOpen(true)}>
                            {t('common.bulkDelete', { count: selectedAssignmentIds.length })}
                        </S.DangerButton>
                    ) : null}
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
                        <S.FilterDropdown ref={targetFilterDropdownRef}>
                            <S.FilterDropdownTrigger type="button" onClick={() => setTargetFilterOpen((open) => !open)}>
                                {selectedFilterTargets.length === 0 ? (
                                    <S.Placeholder>{t('common.all')}</S.Placeholder>
                                ) : (
                                    <S.SelectionSummary>
                                        {selectedFilterTargets.length === 1 ? (
                                            <S.TargetOption>
                                                <TargetIcon type={selectedFilterTargets[0].type} />
                                                <span>
                                                    <S.OptionEyebrow>{selectedFilterTargets[0].eyebrow}</S.OptionEyebrow>
                                                    <S.OptionLabel>{selectedFilterTargets[0].label}</S.OptionLabel>
                                                </span>
                                            </S.TargetOption>
                                        ) : (
                                            <S.OptionLabel>{t('assignments.selectedTargets', { count: selectedFilterTargets.length })}</S.OptionLabel>
                                        )}
                                    </S.SelectionSummary>
                                )}
                                <S.Caret aria-hidden="true">▾</S.Caret>
                            </S.FilterDropdownTrigger>
                            {targetFilterOpen ? (
                                <S.DropdownPanel>
                                    <S.DropdownSearch
                                        value={targetFilterSearch}
                                        onChange={(event) => setTargetFilterSearch(event.target.value)}
                                        placeholder={`${t('common.search')}...`}
                                        autoFocus
                                    />
                                    <S.DropdownList>
                                        {filteredFilterTargets.map((target) => {
                                            const selected = selectedFilterTargetIds.includes(target.id);

                                            return (
                                                <S.DropdownOption
                                                    key={target.id}
                                                    type="button"
                                                    $selected={selected}
                                                    onClick={() => toggleFilterTarget(target.id)}
                                                >
                                                    <S.TargetOption>
                                                        <TargetIcon type={target.type} />
                                                        <span>
                                                            <S.OptionEyebrow>{target.eyebrow}</S.OptionEyebrow>
                                                            <S.OptionLabel>{target.label}</S.OptionLabel>
                                                        </span>
                                                    </S.TargetOption>
                                                    {selected ? <span aria-hidden="true">✓</span> : null}
                                                </S.DropdownOption>
                                            );
                                        })}
                                    </S.DropdownList>
                                </S.DropdownPanel>
                            ) : null}
                        </S.FilterDropdown>
                    </S.FilterControl>
                </S.FilterControls>
            </S.FilterBar>

            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={allVisibleAssignmentsSelected}
                                    aria-label={t('common.selectAll')}
                                    onChange={toggleVisibleAssignmentsSelection}
                                />
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('package')}>
                                    {t('assignments.package')}{sortIndicator('package')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('munki_name')}>
                                    {t('packages.munkiName')}{sortIndicator('munki_name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('action')}>
                                    {t('assignments.action')}{sortIndicator('action')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('target')}>
                                    {t('assignments.target')}{sortIndicator('target')}
                                </S.SortButton>
                            </th>
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
                                        <input
                                            type="checkbox"
                                            checked={selectedAssignmentIds.includes(assignment.id)}
                                            aria-label={t('common.selectRow')}
                                            onChange={() => toggleAssignmentSelection(assignment.id)}
                                        />
                                    </td>
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
                                    <td>
                                        <S.TargetTitle>
                                            <TargetIcon type={assignment.target.type} />
                                            <S.PrimaryCell>{assignment.target.name}</S.PrimaryCell>
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
            <ConfirmModal
                open={bulkDeleteOpen}
                title={t('assignments.bulkDeleteTitle')}
                description={t('assignments.bulkDeleteDescription', { count: selectedAssignmentIds.length })}
                requireConfirmationCheckbox
                confirmationLabel={t('common.confirmBulkDelete')}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={() => {
                    router.delete('/assignments/bulk', {
                        data: { ids: selectedAssignmentIds },
                        onFinish: () => {
                            setBulkDeleteOpen(false);
                            setSelectedAssignmentIds([]);
                        },
                    });
                }}
            />
        </S.AssignmentsManagerContainer>
    );
}
