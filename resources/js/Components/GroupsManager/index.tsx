import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import TableIcon from '../TableIcon';
import { useI18n } from '../../i18n';
import { Group, ManifestPreview } from '../../types';
import * as S from './styled';

type GroupsManagerProps = {
    groups: Group[];
};

export default function GroupsManager({ groups }: GroupsManagerProps) {
    const { t } = useI18n();
    const [createOpen, setCreateOpen] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [search, setSearch] = useState('');
    const [manifestToView, setManifestToView] = useState<{ title: string; manifest: ManifestPreview } | null>(null);
    const form = useForm({
        name: '',
        slug: '',
        notes: '',
    });
    const editForm = useForm({
        name: '',
        slug: '',
        notes: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/groups', {
            onSuccess: () => {
                form.reset();
                setCreateOpen(false);
            },
        });
    }

    function openEditModal(group: Group) {
        setGroupToEdit(group);
        editForm.clearErrors();
        editForm.setData({
            name: group.name,
            slug: group.slug,
            notes: group.notes ?? '',
        });
    }

    function closeEditModal() {
        setGroupToEdit(null);
        editForm.clearErrors();
        editForm.reset();
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
    const filteredGroups = groups.filter((group) =>
        [group.name, group.slug, group.notes ?? ''].join(' ').toLowerCase().includes(normalizedSearch),
    );

    useEffect(() => {
        if (!createOpen && !manifestToView && !groupToEdit) {
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

            if (groupToEdit) {
                closeEditModal();
                return;
            }

            setCreateOpen(false);
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, manifestToView, groupToEdit]);

    return (
        <S.GroupsManagerContainer>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>{t('common.groups')}</S.ToolbarTitle>
                    <S.ToolbarDescription>{t('groups.description')}</S.ToolbarDescription>
                </div>
                <S.Button type="button" onClick={() => setCreateOpen(true)}>
                    {t('common.add')}
                </S.Button>
            </S.Toolbar>

            {createOpen ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setCreateOpen(false);
                        }
                    }}
                >
                    <S.Dialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('groups.addTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('groups.addDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={() => setCreateOpen(false)} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submit}>
                            <FormField label={t('groups.name')} error={form.errors.name}>
                                <S.Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                            </FormField>
                            <FormField label={t('groups.slug')} error={form.errors.slug}>
                                <S.Input
                                    value={form.data.slug}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                    placeholder="team-dev"
                                />
                            </FormField>
                            <S.Full>
                                <FormField label={t('groups.notes')} error={form.errors.notes}>
                                    <S.Textarea
                                        value={form.data.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                    />
                                </FormField>
                            </S.Full>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setCreateOpen(false)}>
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

            {groupToEdit ? (
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
                                    value={editForm.data.name}
                                    onChange={(event) => editForm.setData('name', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('groups.slug')} error={editForm.errors.slug}>
                                <S.Input
                                    value={editForm.data.slug}
                                    onChange={(event) => editForm.setData('slug', event.target.value)}
                                    placeholder="team-dev"
                                />
                            </FormField>
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
                <S.FilterControl>
                    <span>{t('common.search')}</span>
                    <S.FilterInput
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('groups.searchPlaceholder')}
                    />
                </S.FilterControl>
            </S.FilterBar>

            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            <th>{t('common.groups')}</th>
                            <th>{t('groups.slug')}</th>
                            <th>{t('groups.peopleCount')}</th>
                            <th>{t('groups.notes')}</th>
                            <th>{t('common.manifest')}</th>
                            <th>{t('common.mobileconfig')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={7}>{t('groups.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            filteredGroups.map((group) => (
                                <tr key={group.id}>
                                    <td>
                                        <S.PrimaryCell>{group.name}</S.PrimaryCell>
                                        {group.is_system ? <S.SystemBadge>{t('groups.system')}</S.SystemBadge> : null}
                                    </td>
                                    <td>
                                        <S.CodePill>{group.slug}</S.CodePill>
                                    </td>
                                    <td>{group.people_count ?? 0}</td>
                                    <td>{group.notes ?? '-'}</td>
                                    <td>
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
                                    </td>
                                    <td>
                                        <S.TableIconButton
                                            as="a"
                                            href={`/munki/groups/${group.id}/mobileconfig`}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={t('common.downloadMobileconfig')}
                                            title={t('common.downloadMobileconfig')}
                                        >
                                            <TableIcon name="download" />
                                        </S.TableIconButton>
                                    </td>
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
                    <S.Dialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>Manifest · {manifestToView.title}</S.ModalTitle>
                                <S.ModalDescription>{manifestToView.manifest.path}</S.ModalDescription>
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
            <ConfirmModal
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
            />
        </S.GroupsManagerContainer>
    );
}
