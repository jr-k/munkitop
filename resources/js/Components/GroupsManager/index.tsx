import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import MobileconfigModal from '../MobileconfigModal';
import PaginationControls, { usePagination } from '../Pagination';
import TableIcon from '../TableIcon';
import { useI18n } from '../../i18n';
import { can } from '../../permissions';
import { Group, ManifestPreview, PageProps, Person } from '../../types';
import * as S from './styled';

type GroupsManagerProps = {
    groups: Group[];
    people: Person[];
};

type SortDirection = 'asc' | 'desc';
type GroupSortKey = 'name' | 'slug' | 'people_count' | 'notes';

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function GroupsManager({ groups, people }: GroupsManagerProps) {
    const { t } = useI18n();
    const { props } = usePage<PageProps>();
    const canUpdateGroups = can(props, 'groups', 'update');
    const canShareMobileconfigs = can(props, 'links', 'update');
    const canExport = can(props, 'export');
    const [createOpen, setCreateOpen] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [search, setSearch] = useState('');
    const [manifestToView, setManifestToView] = useState<{ title: string; manifest: ManifestPreview } | null>(null);
    const [mobileconfigToView, setMobileconfigToView] = useState<Group | null>(null);
    const [sort, setSort] = useState<{ key: GroupSortKey; direction: SortDirection }>({
        key: 'name',
        direction: 'asc',
    });
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [createSlugEdited, setCreateSlugEdited] = useState(false);
    const [editSlugEdited, setEditSlugEdited] = useState(false);
    const [peopleOpen, setPeopleOpen] = useState(false);
    const [editPeopleOpen, setEditPeopleOpen] = useState(false);
    const [filterPeopleOpen, setFilterPeopleOpen] = useState(false);
    const [filterPeopleSearch, setFilterPeopleSearch] = useState('');
    const [selectedFilterPersonIds, setSelectedFilterPersonIds] = useState<number[]>([]);
    const createPeopleDropdownRef = useRef<HTMLDivElement | null>(null);
    const editPeopleDropdownRef = useRef<HTMLDivElement | null>(null);
    const filterPeopleDropdownRef = useRef<HTMLDivElement | null>(null);
    const form = useForm({
        name: '',
        slug: '',
        person_ids: [] as number[],
        notes: '',
    });
    const editForm = useForm({
        name: '',
        slug: '',
        person_ids: [] as number[],
        notes: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/groups', {
            onSuccess: () => {
                form.reset();
                setCreateSlugEdited(false);
                setPeopleOpen(false);
                setCreateOpen(false);
            },
        });
    }

    function closeCreateModal() {
        setCreateOpen(false);
        setPeopleOpen(false);
        form.clearErrors();
        form.reset();
        setCreateSlugEdited(false);
    }

    function updateCreateName(name: string) {
        form.setData({
            ...form.data,
            name,
            slug: createSlugEdited ? form.data.slug : slugify(name),
        });
    }

    function updateCreateSlug(slug: string) {
        setCreateSlugEdited(true);
        form.setData('slug', slug);
    }

    function personLabel(person: Person) {
        return [person.first_name, person.name].filter(Boolean).join(' ');
    }

    const selectedPeople = people.filter((person) => form.data.person_ids.includes(person.id));
    const selectedEditPeople = people.filter((person) => editForm.data.person_ids.includes(person.id));
    const selectedFilterPeople = people.filter((person) => selectedFilterPersonIds.includes(person.id));
    const normalizedFilterPeopleSearch = filterPeopleSearch.trim().toLowerCase();
    const filteredFilterPeople = people.filter((person) =>
        [personLabel(person), person.email].join(' ').toLowerCase().includes(normalizedFilterPeopleSearch),
    );

    function openEditModal(group: Group) {
        setGroupToEdit(group);
        setEditSlugEdited(false);
        setEditPeopleOpen(false);
        editForm.clearErrors();
        editForm.setData({
            name: group.name,
            slug: group.slug,
            person_ids: group.people?.map((person) => person.id) ?? [],
            notes: group.notes ?? '',
        });
    }

    function closeEditModal() {
        setGroupToEdit(null);
        setEditSlugEdited(false);
        setEditPeopleOpen(false);
        editForm.clearErrors();
        editForm.reset();
    }

    function updateEditName(name: string) {
        editForm.setData({
            ...editForm.data,
            name,
            slug: editSlugEdited ? editForm.data.slug : slugify(name),
        });
    }

    function updateEditSlug(slug: string) {
        setEditSlugEdited(true);
        editForm.setData('slug', slug);
    }

    function togglePerson(personId: number) {
        form.setData(
            'person_ids',
            form.data.person_ids.includes(personId)
                ? form.data.person_ids.filter((selectedId) => selectedId !== personId)
                : [...form.data.person_ids, personId],
        );
    }

    function toggleEditPerson(personId: number) {
        editForm.setData(
            'person_ids',
            editForm.data.person_ids.includes(personId)
                ? editForm.data.person_ids.filter((selectedId) => selectedId !== personId)
                : [...editForm.data.person_ids, personId],
        );
    }

    function toggleFilterPerson(personId: number) {
        setSelectedFilterPersonIds((current) =>
            current.includes(personId)
                ? current.filter((selectedId) => selectedId !== personId)
                : [...current, personId],
        );
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!groupToEdit) {
            return;
        }

        editForm.put(`/groups/${groupToEdit.id}`, {
            onSuccess: closeEditModal,
        });
    }

    const normalizedSearch = search.trim().toLowerCase();
    const filteredGroups = groups
        .filter((group) => {
            if (![group.name, group.slug, group.notes ?? ''].join(' ').toLowerCase().includes(normalizedSearch)) {
                return false;
            }

            if (selectedFilterPersonIds.length === 0) {
                return true;
            }

            return group.people?.some((person) => selectedFilterPersonIds.includes(person.id)) ?? false;
        })
        .sort((firstGroup, secondGroup) => {
            const comparison = String(sortValue(firstGroup, sort.key)).localeCompare(
                String(sortValue(secondGroup, sort.key)),
                undefined,
                { numeric: true, sensitivity: 'base' },
            );

            if (comparison !== 0) {
                return sort.direction === 'asc' ? comparison : -comparison;
            }

            return firstGroup.name.localeCompare(secondGroup.name, undefined, { sensitivity: 'base' });
        });

    function sortValue(group: Group, key: GroupSortKey) {
        return group[key] ?? '';
    }

    function changeSort(key: GroupSortKey) {
        setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    function sortIndicator(key: GroupSortKey) {
        if (sort.key !== key) {
            return '';
        }

        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    const groupsPagination = usePagination(filteredGroups);
    const paginatedGroups = groupsPagination.items;
    const visibleGroupIds = paginatedGroups.filter((group) => !group.is_system).map((group) => group.id);
    const allVisibleGroupsSelected = visibleGroupIds.length > 0
        && visibleGroupIds.every((id) => selectedGroupIds.includes(id));

    function toggleGroupSelection(groupId: number) {
        setSelectedGroupIds((current) =>
            current.includes(groupId)
                ? current.filter((id) => id !== groupId)
                : [...current, groupId],
        );
    }

    function toggleVisibleGroupsSelection() {
        setSelectedGroupIds((current) => {
            if (allVisibleGroupsSelected) {
                return current.filter((id) => !visibleGroupIds.includes(id));
            }

            return Array.from(new Set([...current, ...visibleGroupIds]));
        });
    }

    useEffect(() => {
        if (!createOpen && !manifestToView && !mobileconfigToView && !groupToEdit && !filterPeopleOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            if (manifestToView) {
                setManifestToView(null);
                return;
            }

            if (mobileconfigToView) {
                setMobileconfigToView(null);
                return;
            }

            if (peopleOpen || editPeopleOpen || filterPeopleOpen) {
                setPeopleOpen(false);
                setEditPeopleOpen(false);
                setFilterPeopleOpen(false);
                setFilterPeopleSearch('');
                return;
            }

            if (groupToEdit) {
                closeEditModal();
                return;
            }

            closeCreateModal();
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, manifestToView, mobileconfigToView, groupToEdit, peopleOpen, editPeopleOpen, filterPeopleOpen]);

    useEffect(() => {
        if (!peopleOpen && !editPeopleOpen && !filterPeopleOpen) {
            return;
        }

        function closeOnOutsideClick(event: MouseEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                createPeopleDropdownRef.current?.contains(target)
                || editPeopleDropdownRef.current?.contains(target)
                || filterPeopleDropdownRef.current?.contains(target)
            ) {
                return;
            }

            setPeopleOpen(false);
            setEditPeopleOpen(false);
            setFilterPeopleOpen(false);
            setFilterPeopleSearch('');
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [peopleOpen, editPeopleOpen, filterPeopleOpen]);

    return (
        <S.GroupsManagerContainer>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>{t('common.groups')}</S.ToolbarTitle>
                    <S.ToolbarDescription>{t('groups.description')}</S.ToolbarDescription>
                </div>
                <S.ToolbarActions>
                    {canExport ? (
                        <S.SecondaryButton as="a" href="/groups/csv">
                            {t('common.exportCsv')}
                        </S.SecondaryButton>
                    ) : null}
                    {canUpdateGroups ? (
                        <S.Button type="button" onClick={() => setCreateOpen(true)}>
                            {t('common.add')}
                        </S.Button>
                    ) : null}
                </S.ToolbarActions>
            </S.Toolbar>

            {canUpdateGroups && createOpen ? (
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
                                <S.ModalTitle>{t('groups.addTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('groups.addDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={closeCreateModal} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submit}>
                            <FormField label={t('groups.name')} error={form.errors.name}>
                                <S.Input autoFocus value={form.data.name} onChange={(event) => updateCreateName(event.target.value)} />
                            </FormField>
                            <FormField label={t('groups.slug')} error={form.errors.slug}>
                                <S.Input
                                    value={form.data.slug}
                                    onChange={(event) => updateCreateSlug(event.target.value)}
                                    placeholder="team-dev"
                                />
                            </FormField>
                            <S.Full>
                                <FormField label={t('groups.people')} error={form.errors.person_ids}>
                                    <S.ChipDropdown ref={createPeopleDropdownRef}>
                                        <S.ChipTrigger type="button" onClick={() => setPeopleOpen((open) => !open)}>
                                            {selectedPeople.length === 0 ? (
                                                <S.Placeholder>{t('groups.choosePeople')}</S.Placeholder>
                                            ) : (
                                                <S.ChipList>
                                                    {selectedPeople.map((person) => (
                                                        <S.Chip key={person.id}>{personLabel(person)}</S.Chip>
                                                    ))}
                                                </S.ChipList>
                                            )}
                                            <S.Caret aria-hidden="true">▾</S.Caret>
                                        </S.ChipTrigger>
                                        {peopleOpen ? (
                                            <S.DropdownMenu>
                                                {people.map((person) => {
                                                    const selected = form.data.person_ids.includes(person.id);

                                                    return (
                                                        <S.DropdownOption
                                                            key={person.id}
                                                            type="button"
                                                            $selected={selected}
                                                            onClick={() => togglePerson(person.id)}
                                                        >
                                                            <span>
                                                                <S.OptionLabel>{personLabel(person)}</S.OptionLabel>
                                                                <S.OptionEyebrow>{person.email}</S.OptionEyebrow>
                                                            </span>
                                                            {selected ? <span aria-hidden="true">✓</span> : null}
                                                        </S.DropdownOption>
                                                    );
                                                })}
                                            </S.DropdownMenu>
                                        ) : null}
                                    </S.ChipDropdown>
                                </FormField>
                            </S.Full>
                            <S.Full>
                                <FormField label={t('groups.notes')} error={form.errors.notes}>
                                    <S.Textarea
                                        value={form.data.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                    />
                                </FormField>
                            </S.Full>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={closeCreateModal}>
                                    {t('common.cancel')}
                                </S.SecondaryButton>
                                <S.Button type="submit" disabled={form.processing}>
                                    {t('common.add')}
                                </S.Button>
                            </S.ModalActions>
                        </S.Form>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}

            {canUpdateGroups && groupToEdit ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >
                    <S.Dialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('groups.editTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('groups.editDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={closeEditModal} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submitEdit}>
                            <FormField label={t('groups.name')} error={editForm.errors.name}>
                                <S.Input
                                    autoFocus
                                    value={editForm.data.name}
                                    onChange={(event) => updateEditName(event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('groups.slug')} error={editForm.errors.slug}>
                                <S.Input
                                    value={editForm.data.slug}
                                    onChange={(event) => updateEditSlug(event.target.value)}
                                    placeholder="team-dev"
                                />
                            </FormField>
                            <S.Full>
                                <FormField label={t('groups.people')} error={editForm.errors.person_ids}>
                                    <S.ChipDropdown ref={editPeopleDropdownRef}>
                                        <S.ChipTrigger type="button" onClick={() => setEditPeopleOpen((open) => !open)}>
                                            {selectedEditPeople.length === 0 ? (
                                                <S.Placeholder>{t('groups.noPeople')}</S.Placeholder>
                                            ) : (
                                                <S.ChipList>
                                                    {selectedEditPeople.map((person) => (
                                                        <S.Chip key={person.id}>{personLabel(person)}</S.Chip>
                                                    ))}
                                                </S.ChipList>
                                            )}
                                            <S.Caret aria-hidden="true">▾</S.Caret>
                                        </S.ChipTrigger>
                                        {editPeopleOpen ? (
                                            <S.DropdownMenu>
                                                {people.map((person) => {
                                                    const selected = editForm.data.person_ids.includes(person.id);

                                                    return (
                                                        <S.DropdownOption
                                                            key={person.id}
                                                            type="button"
                                                            $selected={selected}
                                                            onClick={() => toggleEditPerson(person.id)}
                                                        >
                                                            <span>
                                                                <S.OptionLabel>{personLabel(person)}</S.OptionLabel>
                                                                <S.OptionEyebrow>{person.email}</S.OptionEyebrow>
                                                            </span>
                                                            {selected ? <span aria-hidden="true">✓</span> : null}
                                                        </S.DropdownOption>
                                                    );
                                                })}
                                            </S.DropdownMenu>
                                        ) : null}
                                    </S.ChipDropdown>
                                </FormField>
                            </S.Full>
                            <S.Full>
                                <FormField label={t('groups.notes')} error={editForm.errors.notes}>
                                    <S.Textarea
                                        value={editForm.data.notes}
                                        onChange={(event) => editForm.setData('notes', event.target.value)}
                                    />
                                </FormField>
                            </S.Full>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={closeEditModal}>
                                    {t('common.cancel')}
                                </S.SecondaryButton>
                                <S.Button type="submit" disabled={editForm.processing}>
                                    {t('common.save')}
                                </S.Button>
                            </S.ModalActions>
                        </S.Form>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}

            <S.FilterBar>
                <div>
                    <S.FilterTitle>{t('groups.listTitle')}</S.FilterTitle>
                    <S.FilterMeta>{t('people.displayed', { count: filteredGroups.length })}</S.FilterMeta>
                </div>
                <S.FilterControls>
                    {canUpdateGroups && selectedGroupIds.length > 0 ? (
                        <S.DangerButton type="button" onClick={() => setBulkDeleteOpen(true)}>
                            {t('common.bulkDelete', { count: selectedGroupIds.length })}
                        </S.DangerButton>
                    ) : null}
                    <S.FilterControl>
                        <span>{t('common.search')}</span>
                        <S.FilterInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('groups.searchPlaceholder')}
                        />
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>{t('groups.people')}</span>
                        <S.FilterDropdown ref={filterPeopleDropdownRef}>
                            <S.ChipTrigger type="button" onClick={() => setFilterPeopleOpen((open) => !open)}>
                                {selectedFilterPeople.length === 0 ? (
                                    <S.Placeholder>{t('common.all')}</S.Placeholder>
                                ) : (
                                    <S.ChipList>
                                        {selectedFilterPeople.map((person) => (
                                            <S.Chip key={person.id}>{personLabel(person)}</S.Chip>
                                        ))}
                                    </S.ChipList>
                                )}
                                <S.Caret aria-hidden="true">▾</S.Caret>
                            </S.ChipTrigger>
                            {filterPeopleOpen ? (
                                <S.DropdownMenu>
                                    <S.DropdownSearch
                                        value={filterPeopleSearch}
                                        onChange={(event) => setFilterPeopleSearch(event.target.value)}
                                        placeholder={`${t('common.search')}...`}
                                        autoFocus
                                    />
                                    {filteredFilterPeople.map((person) => {
                                        const selected = selectedFilterPersonIds.includes(person.id);

                                        return (
                                            <S.DropdownOption
                                                key={person.id}
                                                type="button"
                                                $selected={selected}
                                                onClick={() => toggleFilterPerson(person.id)}
                                            >
                                                <span>
                                                    <S.OptionLabel>{personLabel(person)}</S.OptionLabel>
                                                    <S.OptionEyebrow>{person.email}</S.OptionEyebrow>
                                                </span>
                                                {selected ? <span aria-hidden="true">✓</span> : null}
                                            </S.DropdownOption>
                                        );
                                    })}
                                </S.DropdownMenu>
                            ) : null}
                        </S.FilterDropdown>
                    </S.FilterControl>
                </S.FilterControls>
            </S.FilterBar>

            <PaginationControls
                page={groupsPagination.page}
                pageCount={groupsPagination.pageCount}
                pageSize={groupsPagination.pageSize}
                total={groupsPagination.total}
                from={groupsPagination.from}
                to={groupsPagination.to}
                onPageChange={groupsPagination.setPage}
                onPageSizeChange={groupsPagination.setPageSize}
            />
            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            {canUpdateGroups ? (
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allVisibleGroupsSelected}
                                        aria-label={t('common.selectAll')}
                                        onChange={toggleVisibleGroupsSelection}
                                    />
                                </th>
                            ) : null}
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('name')}>
                                    {t('common.groups')}{sortIndicator('name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('slug')}>
                                    {t('groups.slug')}{sortIndicator('slug')}
                                </S.SortButton>
                            </th>
                            <S.CenterHeader>
                                <S.SortButton type="button" onClick={() => changeSort('people_count')}>
                                    {t('groups.peopleCount')}{sortIndicator('people_count')}
                                </S.SortButton>
                            </S.CenterHeader>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('notes')}>
                                    {t('groups.notes')}{sortIndicator('notes')}
                                </S.SortButton>
                            </th>
                            <S.CenterHeader>{t('common.manifest')}</S.CenterHeader>
                            <S.CenterHeader>{t('common.mobileconfig')}</S.CenterHeader>
                            {canUpdateGroups ? <th>{t('common.actions')}</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={canUpdateGroups ? 8 : 6}>{t('groups.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            paginatedGroups.map((group) => (
                                <tr key={group.id}>
                                    {canUpdateGroups ? (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedGroupIds.includes(group.id)}
                                                disabled={group.is_system}
                                                aria-label={t('common.selectRow')}
                                                onChange={() => toggleGroupSelection(group.id)}
                                            />
                                        </td>
                                    ) : null}
                                    <td>
                                        <S.PrimaryCell>{group.name}</S.PrimaryCell>
                                        {group.is_system ? <S.SystemBadge>{t('groups.system')}</S.SystemBadge> : null}
                                    </td>
                                    <td>
                                        <S.CodePill>{group.slug}</S.CodePill>
                                    </td>
                                    <S.CountCell>{group.people_count ?? 0}</S.CountCell>
                                    <td>
                                        <S.NotesText>{group.notes ?? '-'}</S.NotesText>
                                    </td>
                                    <S.CenterCell>
                                        {group.manifest ? (
                                            <S.TableIconButton
                                                type="button"
                                                aria-label={t('common.manifest')}
                                                title={t('common.manifest')}
                                                onClick={() => setManifestToView({ title: group.name, manifest: group.manifest })}
                                            >
                                                <TableIcon name="manifest" />
                                            </S.TableIconButton>
                                        ) : (
                                            '-'
                                        )}
                                    </S.CenterCell>
                                    <S.CenterCell>
                                        <S.TableIconButton
                                            type="button"
                                            aria-label={t('common.downloadMobileconfig')}
                                            title={t('common.downloadMobileconfig')}
                                            onClick={() => setMobileconfigToView(group)}
                                        >
                                            <TableIcon name="download" />
                                        </S.TableIconButton>
                                    </S.CenterCell>
                                    {canUpdateGroups ? (
                                        <td>
                                            {group.is_system ? (
                                                <S.Meta>{t('groups.notEditable')}</S.Meta>
                                            ) : (
                                                <S.RowActions>
                                                    <S.TableIconButton
                                                        type="button"
                                                        aria-label={t('common.edit')}
                                                        title={t('common.edit')}
                                                        onClick={() => openEditModal(group)}
                                                    >
                                                        <TableIcon name="edit" />
                                                    </S.TableIconButton>
                                                    <S.TableIconButton
                                                        type="button"
                                                        $tone="danger"
                                                        aria-label={t('common.delete')}
                                                        title={t('common.delete')}
                                                        onClick={() => setGroupToDelete(group)}
                                                    >
                                                        <TableIcon name="delete" />
                                                    </S.TableIconButton>
                                                </S.RowActions>
                                            )}
                                        </td>
                                    ) : null}
                                </tr>
                            ))
                        )}
                    </tbody>
                </S.Table>
            </S.TableCard>
            <PaginationControls
                page={groupsPagination.page}
                pageCount={groupsPagination.pageCount}
                pageSize={groupsPagination.pageSize}
                total={groupsPagination.total}
                from={groupsPagination.from}
                to={groupsPagination.to}
                onPageChange={groupsPagination.setPage}
                onPageSizeChange={groupsPagination.setPageSize}
            />
            {manifestToView ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setManifestToView(null);
                        }
                    }}
                >
                    <S.Dialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>Manifest · {manifestToView.title}</S.ModalTitle>
                                <S.ModalDescription>{manifestToView.manifest.path}</S.ModalDescription>
                                <S.ModalDescription>{t('common.manifestHelp')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={() => setManifestToView(null)} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        {manifestToView.manifest.content ? (
                            <S.ManifestPreview>
                                <code>{manifestToView.manifest.content}</code>
                            </S.ManifestPreview>
                        ) : (
                            <S.EmptyManifest>{t('people.manifestMissing')}</S.EmptyManifest>
                        )}
                        <S.ModalActions>
                            <S.SecondaryButton as="a" href={manifestToView.manifest.url} target="_blank" rel="noreferrer">
                                {t('common.open')}
                            </S.SecondaryButton>
                            <S.SecondaryButton as="a" href={manifestToView.manifest.url} target="_blank" rel="noreferrer" download>
                                {t('common.download')}
                            </S.SecondaryButton>
                            <S.Button type="button" onClick={() => setManifestToView(null)}>
                                {t('common.close')}
                            </S.Button>
                        </S.ModalActions>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}
            {mobileconfigToView ? (
                <MobileconfigModal
                    open
                    title={`Mobileconfig · ${mobileconfigToView.name}`}
                    description={mobileconfigToView.slug}
                    previewUrl={`/munki/groups/${mobileconfigToView.id}/mobileconfig/preview`}
                    downloadUrl={`/munki/groups/${mobileconfigToView.id}/mobileconfig`}
                    shareUrl={`/munki/groups/${mobileconfigToView.id}/mobileconfig/share`}
                    canShare={canShareMobileconfigs}
                    onClose={() => setMobileconfigToView(null)}
                />
            ) : null}
            {canUpdateGroups ? <ConfirmModal
                open={groupToDelete !== null}
                title={t('groups.deleteTitle')}
                description={
                    groupToDelete
                        ? t('groups.deleteDescription', { name: groupToDelete.name })
                        : ''
                }
                onClose={() => setGroupToDelete(null)}
                onConfirm={() => {
                    if (!groupToDelete) {
                        return;
                    }

                    router.delete(`/groups/${groupToDelete.id}`, {
                        onFinish: () => setGroupToDelete(null),
                    });
                }}
            /> : null}
            {canUpdateGroups ? <ConfirmModal
                open={bulkDeleteOpen}
                title={t('groups.bulkDeleteTitle')}
                description={t('groups.bulkDeleteDescription', { count: selectedGroupIds.length })}
                requireConfirmationCheckbox
                confirmationLabel={t('common.confirmBulkDelete')}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={() => {
                    router.delete('/groups/bulk', {
                        data: { ids: selectedGroupIds },
                        onFinish: () => {
                            setBulkDeleteOpen(false);
                            setSelectedGroupIds([]);
                        },
                    });
                }}
            /> : null}
        </S.GroupsManagerContainer>
    );
}
