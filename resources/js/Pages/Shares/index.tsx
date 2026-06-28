import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import FlashMessage from '../../Components/FlashMessage';
import TableIcon from '../../Components/TableIcon';
import { useI18n } from '../../i18n';
import { MobileconfigShare, PageProps } from '../../types';
import * as S from './styled';

type SharesPageProps = PageProps & {
    shares: MobileconfigShare[];
};

type SortDirection = 'asc' | 'desc';
type LinkSortKey = 'ulid' | 'url' | 'target' | 'type' | 'created_at' | 'expires_at' | 'status';

export default function Shares({ shares }: SharesPageProps) {
    const { props } = usePage<SharesPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.admin?.email ?? 'admin';
    const [search, setSearch] = useState('');
    const [shareToEdit, setShareToEdit] = useState<MobileconfigShare | null>(null);
    const [shareToDelete, setShareToDelete] = useState<MobileconfigShare | null>(null);
    const [selectedShareIds, setSelectedShareIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [sort, setSort] = useState<{ key: LinkSortKey; direction: SortDirection }>({
        key: 'created_at',
        direction: 'desc',
    });
    const form = useForm({
        expires_in: 'keep',
    });

    const filteredShares = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return shares
            .filter((share) => {
                const searchable = [
                    share.ulid,
                    share.url,
                    share.target.type,
                    share.target.name ?? '',
                    share.target.identifier ?? '',
                ].join(' ').toLowerCase();

                return !normalizedSearch || searchable.includes(normalizedSearch);
            })
            .sort((firstShare, secondShare) => {
                const comparison = String(sortValue(firstShare, sort.key)).localeCompare(
                    String(sortValue(secondShare, sort.key)),
                    undefined,
                    { numeric: true, sensitivity: 'base' },
                );

                if (comparison !== 0) {
                    return sort.direction === 'asc' ? comparison : -comparison;
                }

                return firstShare.ulid.localeCompare(secondShare.ulid, undefined, { sensitivity: 'base' });
            });
    }, [search, shares, sort]);

    function formatDate(date: string | null) {
        if (!date) {
            return t('shares.never');
        }

        return new Date(date).toLocaleString();
    }

    function sortValue(share: MobileconfigShare, key: LinkSortKey) {
        if (key === 'target') {
            return `${share.target.name ?? ''} ${share.target.identifier ?? ''}`;
        }

        if (key === 'type') {
            return share.target.type === 'group' ? t('common.group') : t('common.person');
        }

        if (key === 'status') {
            return share.expired ? t('shares.expired') : t('shares.active');
        }

        return share[key] ?? '';
    }

    function changeSort(key: LinkSortKey) {
        setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    function sortIndicator(key: LinkSortKey) {
        if (sort.key !== key) {
            return '';
        }

        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    const visibleShareIds = filteredShares.map((share) => share.id);
    const allVisibleSharesSelected = visibleShareIds.length > 0
        && visibleShareIds.every((id) => selectedShareIds.includes(id));

    function toggleShareSelection(shareId: number) {
        setSelectedShareIds((current) =>
            current.includes(shareId)
                ? current.filter((id) => id !== shareId)
                : [...current, shareId],
        );
    }

    function toggleVisibleSharesSelection() {
        setSelectedShareIds((current) => {
            if (allVisibleSharesSelected) {
                return current.filter((id) => !visibleShareIds.includes(id));
            }

            return Array.from(new Set([...current, ...visibleShareIds]));
        });
    }

    function openEditModal(share: MobileconfigShare) {
        setShareToEdit(share);
        form.clearErrors();
        form.setData('expires_in', 'keep');
    }

    function closeEditModal() {
        setShareToEdit(null);
        form.clearErrors();
        form.reset();
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!shareToEdit) {
            return;
        }

        form.put(`/links/${shareToEdit.ulid}`, {
            onSuccess: closeEditModal,
        });
    }

    return (
        <>
            <Head title={t('common.links')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />

                <S.Container>
                    <S.Toolbar>
                        <div>
                            <S.ToolbarTitle>{t('common.links')}</S.ToolbarTitle>
                            <S.ToolbarDescription>{t('shares.description')}</S.ToolbarDescription>
                        </div>
                    </S.Toolbar>

                    <S.FilterBar>
                        <div>
                            <S.FilterTitle>{t('shares.listTitle')}</S.FilterTitle>
                            <S.FilterMeta>{t('people.displayed', { count: filteredShares.length })}</S.FilterMeta>
                        </div>
                        <S.FilterControls>
                            {selectedShareIds.length > 0 ? (
                                <S.DangerButton type="button" onClick={() => setBulkDeleteOpen(true)}>
                                    {t('common.bulkDelete', { count: selectedShareIds.length })}
                                </S.DangerButton>
                            ) : null}
                            <S.FilterControl>
                                <span>{t('common.search')}</span>
                                <S.FilterInput
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={t('shares.searchPlaceholder')}
                                />
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
                                            checked={allVisibleSharesSelected}
                                            aria-label={t('common.selectAll')}
                                            onChange={toggleVisibleSharesSelection}
                                        />
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('ulid')}>
                                            ULID{sortIndicator('ulid')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('url')}>
                                            {t('shares.link')}{sortIndicator('url')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('target')}>
                                            {t('shares.target')}{sortIndicator('target')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('type')}>
                                            {t('shares.type')}{sortIndicator('type')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('created_at')}>
                                            {t('shares.createdAt')}{sortIndicator('created_at')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('expires_at')}>
                                            {t('shares.expiresAt')}{sortIndicator('expires_at')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('status')}>
                                            {t('shares.status')}{sortIndicator('status')}
                                        </S.SortButton>
                                    </th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShares.length === 0 ? (
                                    <tr>
                                        <S.EmptyCell colSpan={9}>{t('shares.noMatch')}</S.EmptyCell>
                                    </tr>
                                ) : (
                                    filteredShares.map((share) => (
                                        <tr key={share.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedShareIds.includes(share.id)}
                                                    aria-label={t('common.selectRow')}
                                                    onChange={() => toggleShareSelection(share.id)}
                                                />
                                            </td>
                                            <td>
                                                <S.CodePill>{share.ulid}</S.CodePill>
                                            </td>
                                            <td>
                                                <S.LinkText href={share.url} target="_blank" rel="noreferrer">
                                                    {share.url}
                                                </S.LinkText>
                                            </td>
                                            <td>
                                                <strong>{share.target.name ?? '-'}</strong>
                                                <br />
                                                <S.CodePill>{share.target.identifier ?? '-'}</S.CodePill>
                                            </td>
                                            <td>{share.target.type === 'group' ? t('common.group') : t('common.person')}</td>
                                            <td>{formatDate(share.created_at)}</td>
                                            <td>{formatDate(share.expires_at)}</td>
                                            <td>
                                                <S.Badge $expired={share.expired}>
                                                    {share.expired ? t('shares.expired') : t('shares.active')}
                                                </S.Badge>
                                            </td>
                                            <td>
                                                <S.RowActions>
                                                    <S.TableIconButton
                                                        type="button"
                                                        aria-label={t('common.edit')}
                                                        title={t('common.edit')}
                                                        onClick={() => openEditModal(share)}
                                                    >
                                                        <TableIcon name="edit" />
                                                    </S.TableIconButton>
                                                    <S.TableIconButton
                                                        type="button"
                                                        $tone="danger"
                                                        aria-label={t('common.delete')}
                                                        title={t('common.delete')}
                                                        onClick={() => setShareToDelete(share)}
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
                </S.Container>

                {shareToEdit ? (
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
                                    <S.ModalTitle>{t('shares.editTitle')}</S.ModalTitle>
                                    <S.ModalDescription>{t('shares.editDescription')}</S.ModalDescription>
                                </div>
                                <S.IconButton type="button" onClick={closeEditModal} aria-label={t('common.close')}>
                                    ×
                                </S.IconButton>
                            </S.ModalHeader>
                            <S.Form onSubmit={submitEdit}>
                                <S.Select value={form.data.expires_in} onChange={(event) => form.setData('expires_in', event.target.value)}>
                                    <option value="keep">{t('shares.keepCurrentExpiration')}</option>
                                    <option value="never">{t('mobileconfig.neverExpires')}</option>
                                    <option value="1d">{t('mobileconfig.expiresInOneDay')}</option>
                                    <option value="7d">{t('mobileconfig.expiresInSevenDays')}</option>
                                    <option value="30d">{t('mobileconfig.expiresInThirtyDays')}</option>
                                </S.Select>
                                <S.ModalActions>
                                    <S.SecondaryButton type="button" onClick={closeEditModal}>
                                        {t('common.cancel')}
                                    </S.SecondaryButton>
                                    <S.Button type="submit" disabled={form.processing}>
                                        {t('common.save')}
                                    </S.Button>
                                </S.ModalActions>
                            </S.Form>
                        </S.Dialog>
                    </S.ModalOverlay>
                ) : null}

                <ConfirmModal
                    open={shareToDelete !== null}
                    title={t('shares.deleteTitle')}
                    description={shareToDelete ? t('shares.deleteDescription', { ulid: shareToDelete.ulid }) : ''}
                    onClose={() => setShareToDelete(null)}
                    onConfirm={() => {
                        if (!shareToDelete) {
                            return;
                        }

                        router.delete(`/links/${shareToDelete.ulid}`, {
                            onFinish: () => setShareToDelete(null),
                        });
                    }}
                />
                <ConfirmModal
                    open={bulkDeleteOpen}
                    title={t('shares.bulkDeleteTitle')}
                    description={t('shares.bulkDeleteDescription', { count: selectedShareIds.length })}
                    requireConfirmationCheckbox
                    confirmationLabel={t('common.confirmBulkDelete')}
                    onClose={() => setBulkDeleteOpen(false)}
                    onConfirm={() => {
                        router.delete('/links/bulk', {
                            data: { ids: selectedShareIds },
                            onFinish: () => {
                                setBulkDeleteOpen(false);
                                setSelectedShareIds([]);
                            },
                        });
                    }}
                />
            </AppLayout>
        </>
    );
}
