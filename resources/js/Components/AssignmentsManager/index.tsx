import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import PaginationControls, { usePagination } from '../Pagination';
import PackageIcon from '../PackageIcon';
import TableIcon from '../TableIcon';
import TargetIcon from '../TargetIcon';
import { useI18n } from '../../i18n';
import { can } from '../../permissions';
import { Assignment, Group, Package, PageProps, Person } from '../../types';
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
type MatrixAction = '-' | 'install' | 'uninstall';
type MatrixTargetRow = {
    key: string;
    type: 'group' | 'person';
    id: number;
    name: string;
    identifier: string;
    groupIds: number[];
    isDefault: boolean;
};

function matrixCellKey(type: 'group' | 'person', targetId: number, packageId: number) {
    return `${type}:${targetId}:${packageId}`;
}

function isDefaultGroup(group: Group) {
    return group.slug.toLowerCase() === 'default' || group.name.toLowerCase() === 'default';
}

function compareByName<T>(label: (item: T) => string) {
    return (firstItem: T, secondItem: T) =>
        label(firstItem).localeCompare(label(secondItem), undefined, { sensitivity: 'base' });
}

export default function AssignmentsManager({ assignments, groups, packages, people }: AssignmentsManagerProps) {
    const { t } = useI18n();
    const { props } = usePage<PageProps>();
    const canUpdateAssignments = can(props, 'assignments', 'update');
    const canExport = can(props, 'export');
    const [createOpen, setCreateOpen] = useState(false);
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [matrixSearch, setMatrixSearch] = useState('');
    const [matrixPackageSearch, setMatrixPackageSearch] = useState('');
    const [matrixUnassignedOnly, setMatrixUnassignedOnly] = useState(false);
    const [matrixRowsWithRulesOnly, setMatrixRowsWithRulesOnly] = useState(false);
    const [savingMatrixCell, setSavingMatrixCell] = useState<string | null>(null);
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

    function resetCreateForm() {
        setPackageDropdownOpen(false);
        setTargetDropdownOpen(false);
        setPackageSearch('');
        setTargetSearch('');
        form.clearErrors();
        form.reset();
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
    const assignmentByMatrixCell = useMemo(() => {
        return assignments.reduce<Record<string, Assignment>>((lookup, assignment) => {
            if (assignment.package.id === null || assignment.target.id === null) {
                return lookup;
            }

            lookup[matrixCellKey(assignment.target.type, assignment.target.id, assignment.package.id)] = assignment;

            return lookup;
        }, {});
    }, [assignments]);
    const matrixPackages = useMemo(() => {
        const assignedPackageIds = new Set(
            assignments
                .map((assignment) => assignment.package.id)
                .filter((packageId): packageId is number => packageId !== null),
        );
        const normalizedSearch = matrixPackageSearch.trim().toLowerCase();

        return packages.filter((pkg) => {
            if (matrixUnassignedOnly && assignedPackageIds.has(pkg.id)) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return [
                pkg.display_name,
                pkg.munki_name,
                pkg.bundle_identifier ?? '',
                pkg.category ?? '',
            ].join(' ').toLowerCase().includes(normalizedSearch);
        });
    }, [assignments, matrixPackageSearch, matrixUnassignedOnly, packages]);
    const matrixRows = useMemo(() => {
        const defaultGroup = groups.find((group) => isDefaultGroup(group));
        const optionalGroups = groups
            .filter((group) => !isDefaultGroup(group))
            .sort(compareByName((group) => group.name));
        const peopleRows = people
            .map<MatrixTargetRow>((person) => ({
                key: `person:${person.id}`,
                type: 'person',
                id: person.id,
                name: personLabel(person),
                identifier: person.client_identifier,
                groupIds: person.groups.map((group) => group.id),
                isDefault: false,
            }))
            .sort(compareByName((person) => person.name));
        const groupRows = [
            ...(defaultGroup ? [defaultGroup] : []),
            ...optionalGroups,
        ].map<MatrixTargetRow>((group) => ({
            key: `group:${group.id}`,
            type: 'group',
            id: group.id,
            name: group.name,
            identifier: group.slug,
            groupIds: [],
            isDefault: isDefaultGroup(group),
        }));

        return [...groupRows, ...peopleRows];
    }, [groups, people]);
    const filteredMatrixRows = useMemo(() => {
        const normalizedSearch = matrixSearch.trim().toLowerCase();

        return matrixRows.filter((row) => {
            if (normalizedSearch) {
                const searchable = [
                    row.name,
                    row.identifier,
                    row.type === 'group' ? t('common.group') : t('common.person'),
                ].join(' ').toLowerCase();

                if (!searchable.includes(normalizedSearch)) {
                    return false;
                }
            }

            if (!matrixRowsWithRulesOnly) {
                return true;
            }

            return matrixPackages.some((pkg) =>
                assignmentByMatrixCell[matrixCellKey(row.type, row.id, pkg.id)] !== undefined,
            );
        });
    }, [assignmentByMatrixCell, matrixPackages, matrixRows, matrixRowsWithRulesOnly, matrixSearch, t]);

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

    function resetFilters() {
        setSearch('');
        setActionFilter('all');
        setSelectedFilterTargetIds([]);
        setTargetFilterOpen(false);
        setTargetFilterSearch('');
    }

    function inheritedRule(row: MatrixTargetRow, pkg: Package) {
        const defaultRow = matrixRows.find((matrixRow) => matrixRow.isDefault);
        const defaultAssignment = defaultRow
            ? assignmentByMatrixCell[matrixCellKey('group', defaultRow.id, pkg.id)]
            : null;

        if (defaultRow && row.key !== defaultRow.key && defaultAssignment) {
            return {
                action: defaultAssignment.action,
                source: defaultRow.name,
            };
        }

        if (row.type !== 'person') {
            return null;
        }

        const inheritedGroup = matrixRows.find((matrixRow) => {
            if (matrixRow.type !== 'group' || matrixRow.isDefault || !row.groupIds.includes(matrixRow.id)) {
                return false;
            }

            return assignmentByMatrixCell[matrixCellKey('group', matrixRow.id, pkg.id)] !== undefined;
        });

        if (!inheritedGroup) {
            return null;
        }

        const inheritedAssignment = assignmentByMatrixCell[matrixCellKey('group', inheritedGroup.id, pkg.id)];

        return inheritedAssignment
            ? {
                action: inheritedAssignment.action,
                source: inheritedGroup.name,
            }
            : null;
    }

    function matrixCellState(row: MatrixTargetRow, pkg: Package) {
        const cellKey = matrixCellKey(row.type, row.id, pkg.id);
        const directAssignment = assignmentByMatrixCell[cellKey] ?? null;
        const inherited = directAssignment ? null : inheritedRule(row, pkg);

        return {
            cellKey,
            directAssignment,
            inherited,
            action: (directAssignment?.action ?? '-') as MatrixAction,
            disabled: savingMatrixCell === cellKey || !canUpdateAssignments,
            saving: savingMatrixCell === cellKey,
        };
    }

    function updateMatrixCell(row: MatrixTargetRow, pkg: Package, nextAction: MatrixAction) {
        const cell = matrixCellState(row, pkg);

        if (
            cell.disabled
            || cell.action === nextAction
            || (!cell.directAssignment && cell.inherited?.action === nextAction)
        ) {
            return;
        }

        setSavingMatrixCell(cell.cellKey);

        if (nextAction === '-') {
            if (!cell.directAssignment) {
                setSavingMatrixCell(null);
                return;
            }

            router.delete(`/assignments/${cell.directAssignment.id}`, {
                preserveScroll: true,
                onFinish: () => setSavingMatrixCell(null),
            });
            return;
        }

        router.post('/assignments', {
            package_ids: [String(pkg.id)],
            targets: [row.key],
            action: nextAction,
        }, {
            preserveScroll: true,
            onFinish: () => setSavingMatrixCell(null),
        });
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

    const assignmentsPagination = usePagination(filteredAssignments);
    const paginatedAssignments = assignmentsPagination.items;
    const visibleAssignmentIds = paginatedAssignments.map((assignment) => assignment.id);
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
        if (!createOpen && !matrixOpen && !targetFilterOpen) {
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
                return;
            }

            setMatrixOpen(false);
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, matrixOpen, packageDropdownOpen, targetDropdownOpen, targetFilterOpen]);

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
                <S.ToolbarActions>
                    {canExport ? (
                        <S.SecondaryButton as="a" href="/assignments/csv">
                            {t('common.exportCsv')}
                        </S.SecondaryButton>
                    ) : null}
                    <S.MatrixButton type="button" onClick={() => setMatrixOpen(true)}>
                        {t('assignments.matrix')}
                    </S.MatrixButton>
                    {canUpdateAssignments ? (
                        <S.Button type="button" onClick={() => setCreateOpen(true)}>
                            {t('common.add')}
                        </S.Button>
                    ) : null}
                </S.ToolbarActions>
            </S.Toolbar>

            {canUpdateAssignments && createOpen ? (
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
                                            autoFocus
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
                                <S.ResetButton type="button" onClick={resetCreateForm}>
                                    {t('common.reset')}
                                </S.ResetButton>
                                <S.Button type="submit" disabled={form.processing}>
                                    {t('assignments.assign')}
                                </S.Button>
                            </S.ModalActions>
                        </S.Form>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}

            {matrixOpen ? (
                <S.FullscreenOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setMatrixOpen(false);
                        }
                    }}
                >
                    <S.FullscreenDialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('assignments.matrixTitle')}</S.ModalTitle>
                                <S.ModalDescription>
                                    {t('assignments.matrixDescription')}
                                </S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={() => setMatrixOpen(false)} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>

                        <S.MatrixControls>
                            <S.FilterInput
                                value={matrixSearch}
                                onChange={(event) => setMatrixSearch(event.target.value)}
                                placeholder={t('assignments.matrixSearch')}
                            />
                            <S.FilterInput
                                value={matrixPackageSearch}
                                onChange={(event) => setMatrixPackageSearch(event.target.value)}
                                placeholder={t('assignments.matrixPackageSearch')}
                            />
                            <S.MatrixSwitchGroup>
                                <S.MatrixSwitch>
                                    <input
                                        type="checkbox"
                                        checked={matrixUnassignedOnly}
                                        onChange={(event) => setMatrixUnassignedOnly(event.target.checked)}
                                    />
                                    <span>{t('assignments.matrixUnassignedOnly')}</span>
                                </S.MatrixSwitch>
                                <S.MatrixSwitch>
                                    <input
                                        type="checkbox"
                                        checked={matrixRowsWithRulesOnly}
                                        onChange={(event) => setMatrixRowsWithRulesOnly(event.target.checked)}
                                    />
                                    <span>{t('assignments.matrixRowsWithRulesOnly')}</span>
                                </S.MatrixSwitch>
                            </S.MatrixSwitchGroup>
                        </S.MatrixControls>

                        <S.MatrixScroll>
                            <S.MatrixTable>
                                <thead>
                                    <tr>
                                        <S.MatrixCornerHeader>{t('assignments.matrixTarget')}</S.MatrixCornerHeader>
                                        {matrixPackages.map((pkg) => (
                                            <S.MatrixPackageHeader key={pkg.id}>
                                                <S.MatrixPackageTitle>
                                                    <PackageIcon iconUrl={pkg.icon_url} name={pkg.display_name} size="sm" />
                                                    <span>{pkg.display_name}</span>
                                                </S.MatrixPackageTitle>
                                            </S.MatrixPackageHeader>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMatrixRows.length === 0 ? (
                                        <tr>
                                            <S.EmptyCell colSpan={matrixPackages.length + 1}>{t('assignments.matrixNoTarget')}</S.EmptyCell>
                                        </tr>
                                    ) : (
                                        filteredMatrixRows.map((row) => (
                                            <tr key={row.key}>
                                                <S.MatrixRowHeader>
                                                    <S.TargetTitle>
                                                        <TargetIcon type={row.type} />
                                                        <span>
                                                            <S.PrimaryCell>{row.name}</S.PrimaryCell>
                                                            <S.MatrixRowMeta>
                                                                {row.type === 'group' ? t('common.group') : t('common.person')}
                                                                {row.identifier ? ` · ${row.identifier}` : ''}
                                                            </S.MatrixRowMeta>
                                                        </span>
                                                    </S.TargetTitle>
                                                </S.MatrixRowHeader>
                                                {matrixPackages.length === 0 ? (
                                                    <S.MatrixEmptyPackageCell>
                                                        {t('assignments.matrixNoUnassignedPackage')}
                                                    </S.MatrixEmptyPackageCell>
                                                ) : null}
                                                {matrixPackages.map((pkg) => {
                                                    const cell = matrixCellState(row, pkg);
                                                    const actionLabel = cell.action === '-'
                                                        ? '-'
                                                        : (cell.action === 'install' ? t('assignments.install') : t('assignments.uninstall'));
                                                    const inheritedActionLabel = cell.inherited?.action === 'uninstall'
                                                        ? t('assignments.uninstall')
                                                        : t('assignments.install');
                                                    const effectiveAction = cell.directAssignment
                                                        ? cell.action
                                                        : (cell.inherited?.action ?? cell.action);
                                                    const cellTitle = cell.inherited
                                                        ? `${inheritedActionLabel} · ${t('assignments.matrixInheritedFrom', { target: cell.inherited.source })}`
                                                        : t('assignments.matrixCellTitle', {
                                                            target: row.name,
                                                            package: pkg.display_name,
                                                            action: actionLabel,
                                                        });

                                                    return (
                                                        <S.MatrixCell
                                                            key={pkg.id}
                                                            $action={cell.inherited?.action ?? cell.action}
                                                            $disabled={cell.disabled}
                                                            $inherited={cell.inherited !== null}
                                                        >
                                                            {cell.saving ? (
                                                                <S.MatrixCellStatus title={cellTitle}>
                                                                    <span>…</span>
                                                                </S.MatrixCellStatus>
                                                            ) : (
                                                                <>
                                                                    <S.MatrixCellSelect
                                                                        value={effectiveAction}
                                                                        $action={effectiveAction}
                                                                        disabled={cell.disabled}
                                                                        aria-label={cellTitle}
                                                                        title={cellTitle}
                                                                        onChange={(event) => updateMatrixCell(row, pkg, event.target.value as MatrixAction)}
                                                                    >
                                                                        <option value="-">-</option>
                                                                        <option value="install">{t('assignments.install')}</option>
                                                                        <option value="uninstall">{t('assignments.uninstall')}</option>
                                                                    </S.MatrixCellSelect>
                                                                    {cell.inherited ? (
                                                                        <S.MatrixInheritedLabel>
                                                                            {t('assignments.matrixInheritedFrom', { target: cell.inherited.source })}
                                                                        </S.MatrixInheritedLabel>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </S.MatrixCell>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </S.MatrixTable>
                        </S.MatrixScroll>
                    </S.FullscreenDialog>
                </S.FullscreenOverlay>
            ) : null}

            <S.FilterBar>
                <div>
                    <S.FilterTitle>{t('assignments.listTitle')}</S.FilterTitle>
                    <S.FilterMeta>{t('people.displayed', { count: filteredAssignments.length })}</S.FilterMeta>
                </div>
                <S.FilterControls>
                    {canUpdateAssignments && selectedAssignmentIds.length > 0 ? (
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
                    <S.DangerButton type="button" onClick={resetFilters} aria-label={t('common.reset')} title={t('common.reset')}>
                        <span aria-hidden="true">↺</span>
                    </S.DangerButton>
                </S.FilterControls>
            </S.FilterBar>

            <PaginationControls
                page={assignmentsPagination.page}
                pageCount={assignmentsPagination.pageCount}
                pageSize={assignmentsPagination.pageSize}
                total={assignmentsPagination.total}
                from={assignmentsPagination.from}
                to={assignmentsPagination.to}
                onPageChange={assignmentsPagination.setPage}
                onPageSizeChange={assignmentsPagination.setPageSize}
            />
            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            {canUpdateAssignments ? (
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allVisibleAssignmentsSelected}
                                        aria-label={t('common.selectAll')}
                                        onChange={toggleVisibleAssignmentsSelection}
                                    />
                                </th>
                            ) : null}
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
                            {canUpdateAssignments ? <th>{t('common.actions')}</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={canUpdateAssignments ? 6 : 4}>{t('assignments.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            paginatedAssignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    {canUpdateAssignments ? (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedAssignmentIds.includes(assignment.id)}
                                                aria-label={t('common.selectRow')}
                                                onChange={() => toggleAssignmentSelection(assignment.id)}
                                            />
                                        </td>
                                    ) : null}
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
                                    {canUpdateAssignments ? (
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
                                    ) : null}
                                </tr>
                            ))
                        )}
                    </tbody>
                </S.Table>
            </S.TableCard>
            <PaginationControls
                page={assignmentsPagination.page}
                pageCount={assignmentsPagination.pageCount}
                pageSize={assignmentsPagination.pageSize}
                total={assignmentsPagination.total}
                from={assignmentsPagination.from}
                to={assignmentsPagination.to}
                onPageChange={assignmentsPagination.setPage}
                onPageSizeChange={assignmentsPagination.setPageSize}
            />
            {canUpdateAssignments ? <ConfirmModal
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
            /> : null}
            {canUpdateAssignments ? <ConfirmModal
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
            /> : null}
        </S.AssignmentsManagerContainer>
    );
}
