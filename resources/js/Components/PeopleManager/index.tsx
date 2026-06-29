import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import MobileconfigModal from '../MobileconfigModal';
import TableIcon from '../TableIcon';
import { useI18n } from '../../i18n';
import { Group, ManifestPreview, Person } from '../../types';
import * as S from './styled';

type PeopleManagerProps = {
    people: Person[];
    groups: Group[];
};

type SortDirection = 'asc' | 'desc';
type PeopleSortKey = 'name' | 'first_name' | 'email' | 'client_identifier' | 'groups';

export default function PeopleManager({ people, groups }: PeopleManagerProps) {
    const { t } = useI18n();
    const [createOpen, setCreateOpen] = useState(false);
    const [groupsOpen, setGroupsOpen] = useState(false);
    const [editGroupsOpen, setEditGroupsOpen] = useState(false);
    const [filterGroupsOpen, setFilterGroupsOpen] = useState(false);
    const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
    const [includeWithoutOptionalTeam, setIncludeWithoutOptionalTeam] = useState(false);
    const [search, setSearch] = useState('');
    const [manifestToView, setManifestToView] = useState<{ title: string; manifest: ManifestPreview } | null>(null);
    const [mobileconfigToView, setMobileconfigToView] = useState<Person | null>(null);
    const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
    const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
    const [sort, setSort] = useState<{ key: PeopleSortKey; direction: SortDirection }>({
        key: 'email',
        direction: 'asc',
    });
    const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const createGroupsDropdownRef = useRef<HTMLDivElement | null>(null);
    const editGroupsDropdownRef = useRef<HTMLDivElement | null>(null);
    const filterGroupsDropdownRef = useRef<HTMLDivElement | null>(null);
    const form = useForm({
        name: '',
        first_name: '',
        email: '',
        notes: '',
        group_ids: [] as number[],
    });
    const editForm = useForm({
        name: '',
        first_name: '',
        email: '',
        notes: '',
        group_ids: [] as number[],
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/people', {
            onSuccess: () => {
                form.reset();
                setGroupsOpen(false);
                setCreateOpen(false);
            },
        });
    }

    const selectableGroups = groups.filter((group) => !group.is_system);
    const selectedGroups = selectableGroups.filter((group) => form.data.group_ids.includes(group.id));
    const selectedEditGroups = selectableGroups.filter((group) => editForm.data.group_ids.includes(group.id));
    const selectedFilterGroups = selectableGroups.filter((group) => selectedTeamIds.includes(group.id));
    const normalizedSearch = search.trim().toLowerCase();
    const visiblePeople = people
        .filter((person) => {
            const searchable = [
                personLabel(person),
                person.email,
                person.client_identifier,
                ...person.groups.map((group) => group.name),
            ]
                .join(' ')
                .toLowerCase();

            if (normalizedSearch && !searchable.includes(normalizedSearch)) {
                return false;
            }

            if (selectedTeamIds.length === 0 && !includeWithoutOptionalTeam) {
                return true;
            }

            const hasSelectedTeam = person.groups.some((group) => selectedTeamIds.includes(group.id));
            const hasNoOptionalTeam = person.groups.every((group) => group.is_system);

            return hasSelectedTeam || (includeWithoutOptionalTeam && hasNoOptionalTeam);
        })
        .sort((firstPerson, secondPerson) => {
            const comparison = String(sortValue(firstPerson, sort.key)).localeCompare(
                String(sortValue(secondPerson, sort.key)),
                undefined,
                { numeric: true, sensitivity: 'base' },
            );

            if (comparison !== 0) {
                return sort.direction === 'asc' ? comparison : -comparison;
            }

            return firstPerson.email.localeCompare(secondPerson.email, undefined, { sensitivity: 'base' });
        });

    function personLabel(person: Person) {
        return [person.first_name, person.name].filter(Boolean).join(' ');
    }

    function sortValue(person: Person, key: PeopleSortKey) {
        if (key === 'groups') {
            return person.groups.map((group) => group.name).join(' ');
        }

        return person[key] ?? '';
    }

    function changeSort(key: PeopleSortKey) {
        setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    function sortIndicator(key: PeopleSortKey) {
        if (sort.key !== key) {
            return '';
        }

        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    const visiblePersonIds = visiblePeople.map((person) => person.id);
    const allVisiblePeopleSelected = visiblePersonIds.length > 0
        && visiblePersonIds.every((id) => selectedPersonIds.includes(id));

    function togglePersonSelection(personId: number) {
        setSelectedPersonIds((current) =>
            current.includes(personId)
                ? current.filter((id) => id !== personId)
                : [...current, personId],
        );
    }

    function toggleVisiblePeopleSelection() {
        setSelectedPersonIds((current) => {
            if (allVisiblePeopleSelected) {
                return current.filter((id) => !visiblePersonIds.includes(id));
            }

            return Array.from(new Set([...current, ...visiblePersonIds]));
        });
    }

    function openEditModal(person: Person) {
        setPersonToEdit(person);
        setEditGroupsOpen(false);
        editForm.clearErrors();
        editForm.setData({
            name: person.name,
            first_name: person.first_name ?? '',
            email: person.email,
            notes: person.notes ?? '',
            group_ids: person.groups.filter((group) => !group.is_system).map((group) => group.id),
        });
    }

    function closeEditModal() {
        setPersonToEdit(null);
        setEditGroupsOpen(false);
        editForm.clearErrors();
        editForm.reset();
    }

    function toggleGroup(groupId: number) {
        form.setData(
            'group_ids',
            form.data.group_ids.includes(groupId)
                ? form.data.group_ids.filter((selectedId) => selectedId !== groupId)
                : [...form.data.group_ids, groupId],
        );
    }

    function toggleEditGroup(groupId: number) {
        editForm.setData(
            'group_ids',
            editForm.data.group_ids.includes(groupId)
                ? editForm.data.group_ids.filter((selectedId) => selectedId !== groupId)
                : [...editForm.data.group_ids, groupId],
        );
    }

    function toggleFilterGroup(groupId: number) {
        setSelectedTeamIds((current) =>
            current.includes(groupId)
                ? current.filter((selectedId) => selectedId !== groupId)
                : [...current, groupId],
        );
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!personToEdit) {
            return;
        }

        editForm.put(`/people/${personToEdit.id}`, {
            onSuccess: closeEditModal,
        });
    }

    useEffect(() => {
        if (!createOpen && !manifestToView && !mobileconfigToView && !personToEdit && !filterGroupsOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            if (groupsOpen || editGroupsOpen || filterGroupsOpen) {
                setGroupsOpen(false);
                setEditGroupsOpen(false);
                setFilterGroupsOpen(false);
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

            if (personToEdit) {
                closeEditModal();
                return;
            }

            setCreateOpen(false);
            setGroupsOpen(false);
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, manifestToView, mobileconfigToView, personToEdit, groupsOpen, editGroupsOpen, filterGroupsOpen]);

    useEffect(() => {
        if (!groupsOpen && !editGroupsOpen && !filterGroupsOpen) {
            return;
        }

        function closeOnOutsideClick(event: MouseEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                createGroupsDropdownRef.current?.contains(target)
                || editGroupsDropdownRef.current?.contains(target)
                || filterGroupsDropdownRef.current?.contains(target)
            ) {
                return;
            }

            setGroupsOpen(false);
            setEditGroupsOpen(false);
            setFilterGroupsOpen(false);
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [groupsOpen, editGroupsOpen, filterGroupsOpen]);

    return (
        <S.PeopleManagerContainer>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>People</S.ToolbarTitle>
                    <S.ToolbarDescription>
                        {t('people.description')}
                    </S.ToolbarDescription>
                </div>
                <S.Button type="button" onClick={() => setCreateOpen(true)}>
                    {t('common.add')}
                </S.Button>
            </S.Toolbar>

            {createOpen ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target !== event.currentTarget) {
                            return;
                        }

                        setCreateOpen(false);
                        setGroupsOpen(false);
                    }}
                >
                    <S.EditDialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('people.addTitle')}</S.ModalTitle>
                                <S.ModalDescription>
                                    {t('people.addDescription')}
                                </S.ModalDescription>
                            </div>
                            <S.IconButton
                                type="button"
                                onClick={() => {
                                    setCreateOpen(false);
                                    setGroupsOpen(false);
                                }}
                                aria-label={t('common.close')}
                            >
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submit}>
                            <FormField label={t('people.name')} error={form.errors.name}>
                                <S.Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                            </FormField>
                            <FormField label={t('people.firstName')} error={form.errors.first_name}>
                                <S.Input
                                    value={form.data.first_name}
                                    onChange={(event) => form.setData('first_name', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('people.email')} error={form.errors.email}>
                                <S.Input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('people.optionalGroups')}>
                                <S.ChipDropdown ref={createGroupsDropdownRef}>
                                    <S.ChipTrigger type="button" onClick={() => setGroupsOpen((open) => !open)}>
                                        {selectedGroups.length === 0 ? (
                                            <S.Placeholder>{t('people.chooseGroups')}</S.Placeholder>
                                        ) : (
                                            <S.ChipList>
                                                {selectedGroups.map((group) => (
                                                    <S.Chip key={group.id}>{group.name}</S.Chip>
                                                ))}
                                            </S.ChipList>
                                        )}
                                        <S.Caret aria-hidden="true">▾</S.Caret>
                                    </S.ChipTrigger>
                                    {groupsOpen ? (
                                        <S.DropdownMenu>
                                            {selectableGroups.map((group) => {
                                                const selected = form.data.group_ids.includes(group.id);

                                                return (
                                                    <S.DropdownOption
                                                        key={group.id}
                                                        type="button"
                                                        $selected={selected}
                                                        onClick={() => toggleGroup(group.id)}
                                                    >
                                                        <span>{group.name}</span>
                                                        {selected ? <span aria-hidden="true">✓</span> : null}
                                                    </S.DropdownOption>
                                                );
                                            })}
                                        </S.DropdownMenu>
                                    ) : null}
                                </S.ChipDropdown>
                            </FormField>
                            <S.Full>
                                <FormField label={t('people.notes')} error={form.errors.notes}>
                                    <S.Textarea
                                        value={form.data.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                    />
                                </FormField>
                            </S.Full>
                            <S.ModalActions>
                                <S.SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setCreateOpen(false);
                                        setGroupsOpen(false);
                                    }}
                                >
                                    {t('common.cancel')}
                                </S.SecondaryButton>
                                <S.Button type="submit" disabled={form.processing}>
                                    {t('common.add')}
                                </S.Button>
                            </S.ModalActions>
                        </S.Form>
                    </S.EditDialog>
                </S.ModalOverlay>
            ) : null}

            <S.FilterBar>
                <div>
                    <S.FilterTitle>{t('people.users')}</S.FilterTitle>
                    <S.FilterMeta>{t('people.displayed', { count: visiblePeople.length })}</S.FilterMeta>
                </div>
                <S.FilterControls>
                    {selectedPersonIds.length > 0 ? (
                        <S.DangerButton type="button" onClick={() => setBulkDeleteOpen(true)}>
                            {t('common.bulkDelete', { count: selectedPersonIds.length })}
                        </S.DangerButton>
                    ) : null}
                    <S.FilterControl>
                        <span>{t('common.search')}</span>
                        <S.FilterInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('people.searchPlaceholder')}
                        />
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>{t('people.team')}</span>
                        <S.FilterDropdown ref={filterGroupsDropdownRef}>
                            <S.ChipTrigger type="button" onClick={() => setFilterGroupsOpen((open) => !open)}>
                                {selectedFilterGroups.length === 0 && !includeWithoutOptionalTeam ? (
                                    <S.Placeholder>{t('people.allTeams')}</S.Placeholder>
                                ) : (
                                    <S.ChipList>
                                        {selectedFilterGroups.map((group) => (
                                            <S.Chip key={group.id}>{group.name}</S.Chip>
                                        ))}
                                        {includeWithoutOptionalTeam ? (
                                            <S.Chip>{t('people.withoutOptionalTeam')}</S.Chip>
                                        ) : null}
                                    </S.ChipList>
                                )}
                                <S.Caret aria-hidden="true">▾</S.Caret>
                            </S.ChipTrigger>
                            {filterGroupsOpen ? (
                                <S.DropdownMenu>
                                    {selectableGroups.map((group) => {
                                        const selected = selectedTeamIds.includes(group.id);

                                        return (
                                            <S.DropdownOption
                                                key={group.id}
                                                type="button"
                                                $selected={selected}
                                                onClick={() => toggleFilterGroup(group.id)}
                                            >
                                                <span>{group.name}</span>
                                                {selected ? <span aria-hidden="true">✓</span> : null}
                                            </S.DropdownOption>
                                        );
                                    })}
                                    <S.DropdownOption
                                        type="button"
                                        $selected={includeWithoutOptionalTeam}
                                        onClick={() => setIncludeWithoutOptionalTeam((selected) => !selected)}
                                    >
                                        <span>{t('people.withoutOptionalTeam')}</span>
                                        {includeWithoutOptionalTeam ? <span aria-hidden="true">✓</span> : null}
                                    </S.DropdownOption>
                                </S.DropdownMenu>
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
                                    checked={allVisiblePeopleSelected}
                                    aria-label={t('common.selectAll')}
                                    onChange={toggleVisiblePeopleSelection}
                                />
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('name')}>
                                    {t('people.name')}{sortIndicator('name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('first_name')}>
                                    {t('people.firstName')}{sortIndicator('first_name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('email')}>
                                    Email{sortIndicator('email')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('client_identifier')}>
                                    ClientIdentifier{sortIndicator('client_identifier')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('groups')}>
                                    {t('people.teams')}{sortIndicator('groups')}
                                </S.SortButton>
                            </th>
                            <th>{t('common.manifest')}</th>
                            <th>{t('common.mobileconfig')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visiblePeople.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={9}>{t('people.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            visiblePeople.map((person) => (
                                <tr key={person.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedPersonIds.includes(person.id)}
                                            aria-label={t('common.selectRow')}
                                            onChange={() => togglePersonSelection(person.id)}
                                        />
                                    </td>
                                    <td>
                                        <S.PrimaryCell>{person.name}</S.PrimaryCell>
                                    </td>
                                    <td>{person.first_name ?? '-'}</td>
                                    <td>{person.email}</td>
                                    <td>
                                        <S.CodePill>{person.client_identifier}</S.CodePill>
                                    </td>
                                    <td>
                                        <S.ChipList>
                                            {person.groups.map((group) => (
                                                <S.Chip key={group.id}>{group.name}</S.Chip>
                                            ))}
                                        </S.ChipList>
                                    </td>
                                    <td>
                                        <S.TableIconButton
                                            type="button"
                                            aria-label={t('common.manifest')}
                                            title={t('common.manifest')}
                                            onClick={() => setManifestToView({ title: personLabel(person), manifest: person.manifest })}
                                        >
                                            <TableIcon name="manifest" />
                                        </S.TableIconButton>
                                    </td>
                                    <td>
                                        <S.TableIconButton
                                            type="button"
                                            aria-label={t('common.downloadMobileconfig')}
                                            title={t('common.downloadMobileconfig')}
                                            onClick={() => setMobileconfigToView(person)}
                                        >
                                            <TableIcon name="download" />
                                        </S.TableIconButton>
                                    </td>
                                    <td>
                                        <S.RowActions>
                                            <S.TableIconButton
                                                type="button"
                                                aria-label={t('common.edit')}
                                                title={t('common.edit')}
                                                onClick={() => openEditModal(person)}
                                            >
                                                <TableIcon name="edit" />
                                            </S.TableIconButton>
                                            <S.TableIconButton
                                                type="button"
                                                $tone="danger"
                                                aria-label={t('common.delete')}
                                                title={t('common.delete')}
                                                onClick={() => setPersonToDelete(person)}
                                            >
                                                <TableIcon name="delete" />
                                            </S.TableIconButton>
                                        </S.RowActions>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </S.Table>
            </S.TableCard>
            {manifestToView ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setManifestToView(null);
                        }
                    }}
                >
                    <S.EditDialog onClick={(event) => event.stopPropagation()}>
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
                    </S.EditDialog>
                </S.ModalOverlay>
            ) : null}
            {mobileconfigToView ? (
                <MobileconfigModal
                    open
                    title={`Mobileconfig · ${personLabel(mobileconfigToView)}`}
                    description={mobileconfigToView.client_identifier}
                    previewUrl={`/munki/people/${mobileconfigToView.id}/mobileconfig/preview`}
                    downloadUrl={`/munki/people/${mobileconfigToView.id}/mobileconfig`}
                    shareUrl={`/munki/people/${mobileconfigToView.id}/mobileconfig/share`}
                    onClose={() => setMobileconfigToView(null)}
                />
            ) : null}
            {personToEdit ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >
                    <S.EditDialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('people.editTitle')}</S.ModalTitle>
                                <S.ModalDescription>
                                    {t('people.editDescription')}
                                </S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={closeEditModal} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>

                        <S.Form onSubmit={submitEdit}>
                            <FormField label={t('people.name')} error={editForm.errors.name}>
                                <S.Input
                                    value={editForm.data.name}
                                    onChange={(event) => editForm.setData('name', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('people.firstName')} error={editForm.errors.first_name}>
                                <S.Input
                                    value={editForm.data.first_name}
                                    onChange={(event) => editForm.setData('first_name', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('people.email')} error={editForm.errors.email}>
                                <S.Input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(event) => editForm.setData('email', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('people.optionalGroups')}>
                                <S.ChipDropdown ref={editGroupsDropdownRef}>
                                    <S.ChipTrigger type="button" onClick={() => setEditGroupsOpen((open) => !open)}>
                                        {selectedEditGroups.length === 0 ? (
                                            <S.Placeholder>{t('people.noOptionalGroup')}</S.Placeholder>
                                        ) : (
                                            <S.ChipList>
                                                {selectedEditGroups.map((group) => (
                                                    <S.Chip key={group.id}>{group.name}</S.Chip>
                                                ))}
                                            </S.ChipList>
                                        )}
                                        <S.Caret aria-hidden="true">▾</S.Caret>
                                    </S.ChipTrigger>
                                    {editGroupsOpen ? (
                                        <S.DropdownMenu>
                                            {selectableGroups.map((group) => {
                                                const selected = editForm.data.group_ids.includes(group.id);

                                                return (
                                                    <S.DropdownOption
                                                        key={group.id}
                                                        type="button"
                                                        $selected={selected}
                                                        onClick={() => toggleEditGroup(group.id)}
                                                    >
                                                        <span>{group.name}</span>
                                                        {selected ? <span aria-hidden="true">✓</span> : null}
                                                    </S.DropdownOption>
                                                );
                                            })}
                                        </S.DropdownMenu>
                                    ) : null}
                                </S.ChipDropdown>
                            </FormField>
                            <S.Full>
                                <FormField label={t('people.notes')} error={editForm.errors.notes}>
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
                    </S.EditDialog>
                </S.ModalOverlay>
            ) : null}
            <ConfirmModal
                open={personToDelete !== null}
                title={t('people.deleteTitle')}
                description={
                    personToDelete
                        ? t('people.deleteDescription', { name: personLabel(personToDelete) })
                        : ''
                }
                onClose={() => setPersonToDelete(null)}
                onConfirm={() => {
                    if (!personToDelete) {
                        return;
                    }

                    router.delete(`/people/${personToDelete.id}`, {
                        onFinish: () => setPersonToDelete(null),
                    });
                }}
            />
            <ConfirmModal
                open={bulkDeleteOpen}
                title={t('people.bulkDeleteTitle')}
                description={t('people.bulkDeleteDescription', { count: selectedPersonIds.length })}
                requireConfirmationCheckbox
                confirmationLabel={t('common.confirmBulkDelete')}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={() => {
                    router.delete('/people/bulk', {
                        data: { ids: selectedPersonIds },
                        onFinish: () => {
                            setBulkDeleteOpen(false);
                            setSelectedPersonIds([]);
                        },
                    });
                }}
            />
        </S.PeopleManagerContainer>
    );
}
