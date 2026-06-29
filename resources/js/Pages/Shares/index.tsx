import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import FlashMessage from '../../Components/FlashMessage';
import PaginationControls, { usePagination } from '../../Components/Pagination';
import TableIcon from '../../Components/TableIcon';
import TargetIcon from '../../Components/TargetIcon';
import { useI18n } from '../../i18n';
import { can } from '../../permissions';
import { Group, MobileconfigShare, PageProps, Person } from '../../types';
import * as S from './styled';

type SharesPageProps = PageProps & {
    shares: MobileconfigShare[];
    people: Person[];
    groups: Group[];
};

type SortDirection = 'asc' | 'desc';
type LinkSortKey = 'ulid' | 'url' | 'target' | 'type' | 'created_at' | 'expires_at' | 'status';

type EmailResponse = {
    sent: boolean;
};

export default function Shares({ shares, people, groups }: SharesPageProps) {
    const { props } = usePage<SharesPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.user?.email ?? 'admin';
    const canUpdateLinks = can(props, 'links', 'update');
    const [search, setSearch] = useState('');
    const [targetsOpen, setTargetsOpen] = useState(false);
    const [targetSearch, setTargetSearch] = useState('');
    const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
    const [shareToEdit, setShareToEdit] = useState<MobileconfigShare | null>(null);
    const [shareToDelete, setShareToDelete] = useState<MobileconfigShare | null>(null);
    const [selectedShareIds, setSelectedShareIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [copiedShareId, setCopiedShareId] = useState<number | null>(null);
    const [shareToEmail, setShareToEmail] = useState<MobileconfigShare | null>(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [sort, setSort] = useState<{ key: LinkSortKey; direction: SortDirection }>({
        key: 'created_at',
        direction: 'desc',
    });
    const form = useForm({
        expires_in: 'keep',
    });
    const targetsDropdownRef = useRef<HTMLDivElement | null>(null);
    const targetOptions = [
        ...groups.map((group) => ({
            id: `group:${group.id}`,
            label: group.name,
            eyebrow: group.slug,
            type: 'group' as const,
        })),
        ...people.map((person) => ({
            id: `person:${person.id}`,
            label: personLabel(person),
            eyebrow: person.email,
            type: 'person' as const,
        })),
    ];
    const selectedTargets = targetOptions.filter((target) => selectedTargetIds.includes(target.id));
    const filteredTargets = targetOptions.filter((target) =>
        [target.eyebrow, target.label].join(' ').toLowerCase().includes(targetSearch.trim().toLowerCase()),
    );

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

                if (normalizedSearch && !searchable.includes(normalizedSearch)) {
                    return false;
                }

                if (selectedTargetIds.length === 0) {
                    return true;
                }

                return share.target.id !== null
                    && selectedTargetIds.includes(`${share.target.type}:${share.target.id}`);
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
    }, [search, selectedTargetIds, shares, sort]);

    function personLabel(person: Person) {
        return [person.first_name, person.name].filter(Boolean).join(' ');
    }

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

    const sharesPagination = usePagination(filteredShares);
    const paginatedShares = sharesPagination.items;
    const visibleShareIds = paginatedShares.map((share) => share.id);
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

    function toggleTarget(targetId: string) {
        setSelectedTargetIds((current) =>
            current.includes(targetId)
                ? current.filter((selectedId) => selectedId !== targetId)
                : [...current, targetId],
        );
    }

    function resetFilters() {
        setSearch('');
        setSelectedTargetIds([]);
        setTargetsOpen(false);
        setTargetSearch('');
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

    function resetEditForm() {
        form.clearErrors();
        form.setData('expires_in', 'keep');
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

    function copyLink(url: string, shareId: number) {
        void navigator.clipboard?.writeText(url).then(() => {
            setCopiedShareId(shareId);
        });
    }

    function emailForShareTarget(share: MobileconfigShare) {
        if (share.target.type !== 'person' || share.target.id === null) {
            return '';
        }

        return people.find((person) => person.id === share.target.id)?.email ?? share.target.email ?? '';
    }

    function openEmailModal(share: MobileconfigShare) {
        setShareToEmail(share);
        setRecipientEmail(emailForShareTarget(share));
        setSendingEmail(false);
        setEmailSent(false);
        setEmailError('');
    }

    function closeEmailModal() {
        setShareToEmail(null);
        setRecipientEmail('');
        setSendingEmail(false);
        setEmailSent(false);
        setEmailError('');
    }

    function sendShareEmail(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!shareToEmail || !recipientEmail.trim()) {
            return;
        }

        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        setSendingEmail(true);
        setEmailSent(false);
        setEmailError('');

        fetch(`/links/${shareToEmail.ulid}/email`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
            },
            body: JSON.stringify({ email: recipientEmail.trim() }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Email request failed');
                }

                return response.json() as Promise<EmailResponse>;
            })
            .then(() => setEmailSent(true))
            .catch(() => setEmailError(t('mobileconfig.emailError')))
            .finally(() => setSendingEmail(false));
    }

    useEffect(() => {
        if (copiedShareId === null) {
            return;
        }

        const timeout = window.setTimeout(() => setCopiedShareId(null), 2400);

        return () => window.clearTimeout(timeout);
    }, [copiedShareId]);

    useEffect(() => {
        if (!targetsOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setTargetsOpen(false);
                setTargetSearch('');
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [targetsOpen]);

    useEffect(() => {
        if (!targetsOpen) {
            return;
        }

        function closeOnOutsideClick(event: MouseEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (targetsDropdownRef.current?.contains(target)) {
                return;
            }

            setTargetsOpen(false);
            setTargetSearch('');
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [targetsOpen]);

    useEffect(() => {
        if (!shareToEdit && !shareToEmail) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            if (shareToEmail) {
                closeEmailModal();
                return;
            }

            if (shareToEdit) {
                closeEditModal();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [shareToEdit, shareToEmail]);

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
                            {canUpdateLinks && selectedShareIds.length > 0 ? (
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
                            <S.FilterControl>
                                <span>{t('shares.target')}</span>
                                <S.FilterDropdown ref={targetsDropdownRef}>
                                    <S.ChipTrigger type="button" onClick={() => setTargetsOpen((open) => !open)}>
                                        {selectedTargets.length === 0 ? (
                                            <S.Placeholder>{t('common.all')}</S.Placeholder>
                                        ) : (
                                            <S.SelectionSummary>
                                                {selectedTargets.length === 1 ? (
                                                    <S.TargetOption>
                                                        <TargetIcon type={selectedTargets[0].type} />
                                                        <span>
                                                            <S.OptionLabel>{selectedTargets[0].label}</S.OptionLabel>
                                                            <S.OptionEyebrow>{selectedTargets[0].eyebrow}</S.OptionEyebrow>
                                                        </span>
                                                    </S.TargetOption>
                                                ) : (
                                                    <S.OptionLabel>{t('assignments.selectedTargets', { count: selectedTargets.length })}</S.OptionLabel>
                                                )}
                                            </S.SelectionSummary>
                                        )}
                                        <S.Caret aria-hidden="true">▾</S.Caret>
                                    </S.ChipTrigger>
                                    {targetsOpen ? (
                                        <S.DropdownMenu>
                                            <S.DropdownSearch
                                                value={targetSearch}
                                                onChange={(event) => setTargetSearch(event.target.value)}
                                                placeholder={`${t('common.search')}...`}
                                                autoFocus
                                            />
                                            <S.DropdownList>
                                                {filteredTargets.map((target) => {
                                                    const selected = selectedTargetIds.includes(target.id);

                                                    return (
                                                        <S.DropdownOption
                                                            key={target.id}
                                                            type="button"
                                                            $selected={selected}
                                                            onClick={() => toggleTarget(target.id)}
                                                        >
                                                            <S.TargetOption>
                                                                <TargetIcon type={target.type} />
                                                                <span>
                                                                    <S.OptionLabel>{target.label}</S.OptionLabel>
                                                                    <S.OptionEyebrow>{target.eyebrow}</S.OptionEyebrow>
                                                                </span>
                                                            </S.TargetOption>
                                                            {selected ? <span aria-hidden="true">✓</span> : null}
                                                        </S.DropdownOption>
                                                    );
                                                })}
                                            </S.DropdownList>
                                        </S.DropdownMenu>
                                    ) : null}
                                </S.FilterDropdown>
                            </S.FilterControl>
                            <S.DangerButton type="button" onClick={resetFilters} aria-label={t('common.reset')} title={t('common.reset')}>
                                <span aria-hidden="true">↺</span>
                            </S.DangerButton>
                        </S.FilterControls>
                    </S.FilterBar>

                    <PaginationControls
                        page={sharesPagination.page}
                        pageCount={sharesPagination.pageCount}
                        pageSize={sharesPagination.pageSize}
                        total={sharesPagination.total}
                        from={sharesPagination.from}
                        to={sharesPagination.to}
                        onPageChange={sharesPagination.setPage}
                        onPageSizeChange={sharesPagination.setPageSize}
                    />
                    <S.TableCard>
                        <S.Table>
                            <thead>
                                <tr>
                                    {canUpdateLinks ? (
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={allVisibleSharesSelected}
                                                aria-label={t('common.selectAll')}
                                                onChange={toggleVisibleSharesSelection}
                                            />
                                        </th>
                                    ) : null}
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('ulid')}>
                                            ULID{sortIndicator('ulid')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('status')}>
                                            {t('shares.status')}{sortIndicator('status')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('url')}>
                                            {t('shares.link')}{sortIndicator('url')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('type')}>
                                            {t('shares.type')}{sortIndicator('type')}
                                        </S.SortButton>
                                    </th>
                                    <th>
                                        <S.SortButton type="button" onClick={() => changeSort('target')}>
                                            {t('shares.target')}{sortIndicator('target')}
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
                                    {canUpdateLinks ? <th>{t('common.actions')}</th> : null}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShares.length === 0 ? (
                                    <tr>
                                        <S.EmptyCell colSpan={canUpdateLinks ? 9 : 7}>{t('shares.noMatch')}</S.EmptyCell>
                                    </tr>
                                ) : (
                                    paginatedShares.map((share) => (
                                        <tr key={share.id}>
                                            {canUpdateLinks ? (
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedShareIds.includes(share.id)}
                                                        aria-label={t('common.selectRow')}
                                                        onChange={() => toggleShareSelection(share.id)}
                                                    />
                                                </td>
                                            ) : null}
                                            <td>
                                                <S.CodePill>{share.ulid}</S.CodePill>
                                            </td>
                                            <td>
                                                <S.Badge $expired={share.expired}>
                                                    {share.expired ? t('shares.expired') : t('shares.active')}
                                                </S.Badge>
                                            </td>
                                            <td>
                                                <S.LinkField>
                                                    <S.LinkInput
                                                        value={share.url}
                                                        readOnly
                                                        aria-label={t('shares.link')}
                                                        onFocus={(event) => event.target.select()}
                                                    />
                                                    <S.TableIconButton
                                                        type="button"
                                                        $size="compact"
                                                        aria-label={t('mobileconfig.copyLink')}
                                                        title={copiedShareId === share.id ? t('mobileconfig.copied') : t('mobileconfig.copyLink')}
                                                        onClick={() => copyLink(share.url, share.id)}
                                                    >
                                                        <TableIcon name="copy" />
                                                    </S.TableIconButton>
                                                </S.LinkField>
                                            </td>
                                            <td>
                                                {share.target.type === 'group' || share.target.type === 'person' ? (
                                                    <S.TypeIconLabel
                                                        aria-label={share.target.type === 'group' ? t('common.group') : t('common.person')}
                                                        tabIndex={0}
                                                    >
                                                        <TargetIcon type={share.target.type} />
                                                        <S.TypeTooltip role="tooltip">
                                                            {share.target.type === 'group' ? t('common.group') : t('common.person')}
                                                        </S.TypeTooltip>
                                                    </S.TypeIconLabel>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td>
                                                <S.TargetCell>
                                                    <S.TargetName>{share.target.name ?? '-'}</S.TargetName>
                                                    <S.CodePill>{share.target.identifier ?? '-'}</S.CodePill>
                                                </S.TargetCell>
                                            </td>
                                            <td>
                                                <S.DateText>{formatDate(share.created_at)}</S.DateText>
                                            </td>
                                            <td>
                                                <S.DateText>{formatDate(share.expires_at)}</S.DateText>
                                            </td>
                                            {canUpdateLinks ? (
                                                <td>
                                                    <S.RowActions>
                                                        <S.TableIconButton
                                                            type="button"
                                                            $tone="warning"
                                                            aria-label={t('mobileconfig.emailTitle')}
                                                            title={t('mobileconfig.emailTitle')}
                                                            onClick={() => openEmailModal(share)}
                                                        >
                                                            <TableIcon name="email" />
                                                        </S.TableIconButton>
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
                                            ) : null}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </S.Table>
                    </S.TableCard>
                    <PaginationControls
                        page={sharesPagination.page}
                        pageCount={sharesPagination.pageCount}
                        pageSize={sharesPagination.pageSize}
                        total={sharesPagination.total}
                        from={sharesPagination.from}
                        to={sharesPagination.to}
                        onPageChange={sharesPagination.setPage}
                        onPageSizeChange={sharesPagination.setPageSize}
                    />
                </S.Container>

                {canUpdateLinks && shareToEdit ? (
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
                                <S.Select
                                    autoFocus
                                    value={form.data.expires_in}
                                    onChange={(event) => form.setData('expires_in', event.target.value)}
                                >
                                    <option value="keep">{t('shares.keepCurrentExpiration')}</option>
                                    <option value="never">{t('mobileconfig.neverExpires')}</option>
                                    <option value="1d">{t('mobileconfig.expiresInOneDay')}</option>
                                    <option value="7d">{t('mobileconfig.expiresInSevenDays')}</option>
                                    <option value="30d">{t('mobileconfig.expiresInThirtyDays')}</option>
                                </S.Select>
                                <S.ModalActions>
                                    <S.Button type="submit" disabled={form.processing}>
                                        {t('common.save')}
                                    </S.Button>
                                </S.ModalActions>
                            </S.Form>
                        </S.Dialog>
                    </S.ModalOverlay>
                ) : null}

                {canUpdateLinks && shareToEmail ? (
                    <S.ModalOverlay
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeEmailModal();
                            }
                        }}
                    >
                        <S.Dialog
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="share-email-modal-title"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <S.ModalHeader>
                                <div>
                                    <S.ModalTitle id="share-email-modal-title">{t('mobileconfig.emailTitle')}</S.ModalTitle>
                                    <S.ModalDescription>{t('mobileconfig.emailDescription')}</S.ModalDescription>
                                </div>
                                <S.IconButton type="button" onClick={closeEmailModal} aria-label={t('common.close')}>
                                    ×
                                </S.IconButton>
                            </S.ModalHeader>
                            <S.EmailSummary>
                                <S.TargetName>{shareToEmail.target.name ?? shareToEmail.ulid}</S.TargetName>
                                <S.LinkInput
                                    value={shareToEmail.url}
                                    readOnly
                                    aria-label={t('shares.link')}
                                    onFocus={(event) => event.target.select()}
                                />
                            </S.EmailSummary>
                            <S.Form onSubmit={sendShareEmail}>
                                <S.FormLabel>
                                    <span>{t('mobileconfig.recipientEmail')}</span>
                                    <S.TextInput
                                        type="email"
                                        value={recipientEmail}
                                        placeholder={t('mobileconfig.recipientEmailPlaceholder')}
                                        onChange={(event) => {
                                            setRecipientEmail(event.target.value);
                                            setEmailSent(false);
                                            setEmailError('');
                                        }}
                                        autoFocus
                                    />
                                </S.FormLabel>
                                {emailSent ? (
                                    <S.EmailStatus role="status">
                                        {t('mobileconfig.emailSent', { email: recipientEmail.trim() })}
                                    </S.EmailStatus>
                                ) : null}
                                {emailError ? <S.EmailError role="alert">{emailError}</S.EmailError> : null}
                                <S.ModalActions>
                                    <S.Button type="submit" disabled={sendingEmail || !recipientEmail.trim()}>
                                        {sendingEmail ? t('mobileconfig.emailSending') : t('mobileconfig.emailSend')}
                                    </S.Button>
                                </S.ModalActions>
                            </S.Form>
                        </S.Dialog>
                    </S.ModalOverlay>
                ) : null}

                {canUpdateLinks ? <ConfirmModal
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
                /> : null}
                {canUpdateLinks ? <ConfirmModal
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
                /> : null}
                {copiedShareId !== null ? <S.Toast role="status">{t('mobileconfig.copied')}</S.Toast> : null}
            </AppLayout>
        </>
    );
}
