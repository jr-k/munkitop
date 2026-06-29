import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import FormField from '../FormField';
import PackageIcon from '../PackageIcon';
import TableIcon from '../TableIcon';
import TargetIcon from '../TargetIcon';
import { useI18n } from '../../i18n';
import { can } from '../../permissions';
import { Package, PageProps } from '../../types';
import * as S from './styled';

type PackagesManagerProps = {
    packages: Package[];
};

type PackageFormData = {
    munki_name: string;
    display_name: string;
    bundle_identifier: string;
    version: string;
    icon: File | null;
    pkg_source: 'url' | 'upload';
    pkg_file: File | null;
    hash: string;
    pkg_url: string;
    active: boolean;
};

type SortDirection = 'asc' | 'desc';
type PackageSortKey =
    | 'display_name'
    | 'munki_name'
    | 'bundle_identifier'
    | 'version'
    | 'source'
    | 'active'
    | 'assignments_count'
    | 'hash';

export default function PackagesManager({ packages }: PackagesManagerProps) {
    const { t } = useI18n();
    const { props } = usePage<PageProps>();
    const canUpdatePackages = can(props, 'packages', 'update');
    const canExport = can(props, 'export');
    const [createOpen, setCreateOpen] = useState(false);
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [matrixMode, setMatrixMode] = useState<'profiles' | 'packages'>('profiles');
    const [matrixSearch, setMatrixSearch] = useState('');
    const [packageToEdit, setPackageToEdit] = useState<Package | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sort, setSort] = useState<{ key: PackageSortKey; direction: SortDirection }>({
        key: 'display_name',
        direction: 'asc',
    });
    const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const form = useForm<PackageFormData>({
        munki_name: '',
        display_name: '',
        bundle_identifier: '',
        version: '',
        icon: null,
        pkg_source: 'url',
        pkg_file: null,
        hash: '',
        pkg_url: '',
        active: true,
    });
    const editForm = useForm<PackageFormData>({
        munki_name: '',
        display_name: '',
        bundle_identifier: '',
        version: '',
        icon: null,
        pkg_source: 'url',
        pkg_file: null,
        hash: '',
        pkg_url: '',
        active: true,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/packages', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setCreateOpen(false);
            },
        });
    }

    function openEditModal(pkg: Package) {
        setPackageToEdit(pkg);
        editForm.clearErrors();
        editForm.setData({
            munki_name: pkg.munki_name,
            display_name: pkg.display_name,
            bundle_identifier: pkg.bundle_identifier ?? '',
            version: pkg.version ?? '',
            icon: null,
            pkg_source: pkg.pkg_path ? 'upload' : 'url',
            pkg_file: null,
            hash: pkg.hash,
            pkg_url: pkg.pkg_url ?? '',
            active: pkg.active,
        });
    }

    function closeEditModal() {
        setPackageToEdit(null);
        editForm.clearErrors();
        editForm.reset();
    }

    function submitEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!packageToEdit) {
            return;
        }

        editForm.transform((data) => ({
            ...data,
            _method: 'put',
        }));
        editForm.post(`/packages/${packageToEdit.id}`, {
            forceFormData: true,
            onSuccess: closeEditModal,
        });
    }

    const normalizedSearch = search.trim().toLowerCase();
    const filteredPackages = packages
        .filter((pkg) => {
            const source = pkg.pkg_path ? 'uploaded' : 'remote';
            const status = pkg.active ? 'active' : 'inactive';
            const searchable = [
                pkg.display_name,
                pkg.munki_name,
                pkg.bundle_identifier ?? '',
                pkg.version ?? '',
                pkg.pkg_url ?? '',
                pkg.hash,
            ].join(' ').toLowerCase();

            return (
                (!normalizedSearch || searchable.includes(normalizedSearch)) &&
                (sourceFilter === 'all' || sourceFilter === source) &&
                (statusFilter === 'all' || statusFilter === status)
            );
        })
        .sort((firstPackage, secondPackage) => {
            const comparison = String(sortValue(firstPackage, sort.key)).localeCompare(
                String(sortValue(secondPackage, sort.key)),
                undefined,
                { numeric: true, sensitivity: 'base' },
            );

            if (comparison !== 0) {
                return sort.direction === 'asc' ? comparison : -comparison;
            }

            return firstPackage.display_name.localeCompare(secondPackage.display_name, undefined, { sensitivity: 'base' });
        });
    const normalizedMatrixSearch = matrixSearch.trim().toLowerCase();
    const packageMatrixRows = packages
        .map((pkg) => ({
            package: pkg,
            profiles: pkg.assignments ?? [],
        }))
        .filter((row) => {
            const searchable = [
                row.package.display_name,
                row.package.munki_name,
                ...row.profiles.flatMap((assignment) => [
                    assignment.target.name ?? '',
                    assignment.target.identifier ?? '',
                    assignment.target.type,
                    assignment.action,
                ]),
            ]
                .join(' ')
                .toLowerCase();

            return !normalizedMatrixSearch || searchable.includes(normalizedMatrixSearch);
        });
    const profileMatrixRows = Object.values(
        packages.reduce<
            Record<
                string,
                {
                    target: NonNullable<Package['assignments']>[number]['target'];
                    assignments: { package: Package; action: 'install' | 'uninstall' }[];
                }
            >
        >((rows, pkg) => {
            (pkg.assignments ?? []).forEach((assignment) => {
                const key = `${assignment.target.type}:${assignment.target.id}`;

                rows[key] ??= {
                    target: assignment.target,
                    assignments: [],
                };
                rows[key].assignments.push({
                    package: pkg,
                    action: assignment.action,
                });
            });

            return rows;
        }, {}),
    ).filter((row) => {
        const searchable = [
            row.target.name ?? '',
            row.target.identifier ?? '',
            row.target.type,
            ...row.assignments.flatMap((assignment) => [
                assignment.package.display_name,
                assignment.package.munki_name,
                assignment.action,
            ]),
        ]
            .join(' ')
            .toLowerCase();

        return !normalizedMatrixSearch || searchable.includes(normalizedMatrixSearch);
    });
    const editPackageFileUrl = packageToEdit?.pkg_file_url ?? null;
    const editPackageDownloadUrl = editPackageFileUrl ? `${editPackageFileUrl}?download=1` : null;
    const editPackageIconUrl = packageToEdit?.icon_url ?? null;
    const editPackageRemoteUrl = editForm.data.pkg_url.trim();
    const createUploadProgress = form.data.pkg_source === 'upload' && form.progress
        ? Math.round(form.progress.percentage ?? 0)
        : null;
    const editUploadProgress = editForm.data.pkg_source === 'upload' && editForm.progress
        ? Math.round(editForm.progress.percentage ?? 0)
        : null;

    function sortValue(pkg: Package, key: PackageSortKey) {
        if (key === 'source') {
            return pkg.pkg_path ? t('packages.sourceUploaded') : t('packages.sourceRemote');
        }

        if (key === 'active') {
            return pkg.active ? t('packages.activeStatus') : t('packages.inactiveStatus');
        }

        return pkg[key] ?? '';
    }

    function changeSort(key: PackageSortKey) {
        setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    function sortIndicator(key: PackageSortKey) {
        if (sort.key !== key) {
            return '';
        }

        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    function renderUploadProgress(progress: number | null) {
        if (progress === null) {
            return null;
        }

        const boundedProgress = Math.max(0, Math.min(100, progress));
        const label = boundedProgress >= 100
            ? t('packages.uploadProcessing')
            : t('packages.uploadProgress', { percentage: boundedProgress });

        return (
            <S.UploadProgress>
                <S.UploadProgressMeta>
                    <span>{label}</span>
                    <strong>{boundedProgress}%</strong>
                </S.UploadProgressMeta>
                <S.UploadProgressTrack
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={boundedProgress}
                    aria-label={t('packages.uploadProgressLabel')}
                >
                    <S.UploadProgressBar $value={boundedProgress} />
                </S.UploadProgressTrack>
            </S.UploadProgress>
        );
    }

    const visiblePackageIds = filteredPackages.map((pkg) => pkg.id);
    const allVisiblePackagesSelected = visiblePackageIds.length > 0
        && visiblePackageIds.every((id) => selectedPackageIds.includes(id));

    function togglePackageSelection(packageId: number) {
        setSelectedPackageIds((current) =>
            current.includes(packageId)
                ? current.filter((id) => id !== packageId)
                : [...current, packageId],
        );
    }

    function toggleVisiblePackagesSelection() {
        setSelectedPackageIds((current) => {
            if (allVisiblePackagesSelected) {
                return current.filter((id) => !visiblePackageIds.includes(id));
            }

            return Array.from(new Set([...current, ...visiblePackageIds]));
        });
    }

    useEffect(() => {
        if (!createOpen && !matrixOpen && !packageToEdit) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setCreateOpen(false);
                setMatrixOpen(false);
                closeEditModal();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [createOpen, matrixOpen, packageToEdit]);

    return (
        <S.PackagesManagerContainer>
            <S.Toolbar>
                <div>
                    <S.ToolbarTitle>{t('common.packages')}</S.ToolbarTitle>
                    <S.ToolbarDescription>{t('packages.description')}</S.ToolbarDescription>
                </div>
                <S.ToolbarActions>
                    <S.SecondaryButton type="button" onClick={() => setMatrixOpen(true)}>
                        {t('packages.crossView')}
                    </S.SecondaryButton>
                    {canExport ? (
                        <S.SecondaryButton as="a" href="/packages/csv">
                            {t('common.exportCsv')}
                        </S.SecondaryButton>
                    ) : null}
                    {canUpdatePackages ? (
                        <S.Button type="button" onClick={() => setCreateOpen(true)}>
                            {t('common.add')}
                        </S.Button>
                    ) : null}
                </S.ToolbarActions>
            </S.Toolbar>

            {canUpdatePackages && createOpen ? (
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
                                <S.ModalTitle>{t('packages.addTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('packages.addDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={() => setCreateOpen(false)} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submit}>
                    <FormField label={t('packages.munkiName')} error={form.errors.munki_name}>
                        <S.Input
                            value={form.data.munki_name}
                            onChange={(event) => {
                                const munkiName = event.target.value;

                                form.setData((data) => ({
                                    ...data,
                                    munki_name: munkiName,
                                    display_name:
                                        data.display_name === '' || data.display_name === data.munki_name
                                            ? munkiName
                                            : data.display_name,
                                }));
                            }}
                            placeholder="Google Chrome"
                        />
                    </FormField>
                    <FormField label={t('packages.displayName')} error={form.errors.display_name}>
                        <S.Input
                            value={form.data.display_name}
                            onChange={(event) => form.setData('display_name', event.target.value)}
                        />
                    </FormField>
                    <FormField label={t('packages.bundleIdentifier')} error={form.errors.bundle_identifier}>
                        <S.Input
                            value={form.data.bundle_identifier}
                            onChange={(event) => form.setData('bundle_identifier', event.target.value)}
                            placeholder={t('packages.bundleIdentifierPlaceholder')}
                        />
                    </FormField>
                    <FormField label={t('packages.version')} error={form.errors.version}>
                        <S.Input
                            value={form.data.version}
                            onChange={(event) => form.setData('version', event.target.value)}
                            placeholder={t('packages.versionPlaceholder')}
                        />
                    </FormField>
                    <FormField label={t('packages.icon')} error={form.errors.icon}>
                        <S.Input
                            type="file"
                            accept=".icns"
                            onChange={(event) => form.setData('icon', event.target.files?.[0] ?? null)}
                        />
                    </FormField>
                    <FormField label={t('packages.source')}>
                        <S.Select
                            value={form.data.pkg_source}
                            onChange={(event) => {
                                const source = event.target.value as 'url' | 'upload';
                                form.setData((data) => ({
                                    ...data,
                                    pkg_source: source,
                                    pkg_url: source === 'upload' ? '' : data.pkg_url,
                                    pkg_file: source === 'url' ? null : data.pkg_file,
                                }));
                            }}
                        >
                            <option value="url">{t('packages.remoteUrl')}</option>
                            <option value="upload">{t('packages.localUpload')}</option>
                        </S.Select>
                    </FormField>
                    <S.Full>
                        {form.data.pkg_source === 'url' ? (
                            <FormField label={t('packages.pkgUrl')} error={form.errors.pkg_url}>
                                <S.Input
                                    type="url"
                                    value={form.data.pkg_url}
                                    onChange={(event) => form.setData('pkg_url', event.target.value)}
                                />
                            </FormField>
                        ) : (
                            <FormField label={t('packages.pkgFile')} error={form.errors.pkg_file}>
                                <S.Input
                                    type="file"
                                    accept=".pkg,.dmg"
                                    onChange={(event) => form.setData('pkg_file', event.target.files?.[0] ?? null)}
                                />
                            </FormField>
                        )}
                    </S.Full>
                    <S.Full>
                        <FormField label={t('packages.hash')} error={form.errors.hash}>
                            <S.Input
                                value={form.data.hash}
                                onChange={(event) => form.setData('hash', event.target.value)}
                                placeholder={
                                    form.data.pkg_source === 'upload'
                                        ? t('packages.hashAutoPlaceholder')
                                        : t('packages.hashPlaceholder')
                                }
                            />
                        </FormField>
                    </S.Full>
                    <S.Full>
                        <S.SwitchLabel>
                            <S.SwitchInput
                                type="checkbox"
                                checked={form.data.active}
                                onChange={(event) => form.setData('active', event.target.checked)}
                            />
                            <S.SwitchTrack aria-hidden="true">
                                <S.SwitchThumb />
                            </S.SwitchTrack>
                            <S.SwitchText>
                                <strong>{t('packages.active')}</strong>
                                <span>{t('packages.activeHelp')}</span>
                            </S.SwitchText>
                        </S.SwitchLabel>
                    </S.Full>
                    {renderUploadProgress(createUploadProgress)}
                    <S.Full>
                        <S.Button type="submit" disabled={form.processing}>
                            {form.processing ? <S.ButtonSpinner aria-label={t('packages.importing')} /> : t('packages.import')}
                        </S.Button>
                    </S.Full>
                </S.Form>
                    </S.Dialog>
                </S.ModalOverlay>
            ) : null}

            {canUpdatePackages && packageToEdit ? (
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
                                <S.ModalTitle>{t('packages.editTitle')}</S.ModalTitle>
                                <S.ModalDescription>{t('packages.editDescription')}</S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={closeEditModal} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>
                        <S.Form onSubmit={submitEdit}>
                            <FormField label={t('packages.munkiName')} error={editForm.errors.munki_name}>
                                <S.Input
                                    value={editForm.data.munki_name}
                                    onChange={(event) => editForm.setData('munki_name', event.target.value)}
                                    placeholder="Google Chrome"
                                />
                            </FormField>
                            <FormField label={t('packages.displayName')} error={editForm.errors.display_name}>
                                <S.Input
                                    value={editForm.data.display_name}
                                    onChange={(event) => editForm.setData('display_name', event.target.value)}
                                />
                            </FormField>
                            <FormField label={t('packages.bundleIdentifier')} error={editForm.errors.bundle_identifier}>
                                <S.Input
                                    value={editForm.data.bundle_identifier}
                                    onChange={(event) => editForm.setData('bundle_identifier', event.target.value)}
                                    placeholder={t('packages.bundleIdentifierPlaceholder')}
                                />
                            </FormField>
                            <FormField label={t('packages.version')} error={editForm.errors.version}>
                                <S.Input
                                    value={editForm.data.version}
                                    onChange={(event) => editForm.setData('version', event.target.value)}
                                    placeholder={t('packages.versionPlaceholder')}
                                />
                            </FormField>
                            <FormField label={t('packages.icon')} error={editForm.errors.icon}>
                                <S.FieldWithActions>
                                    <S.Input
                                        type="file"
                                        accept=".icns"
                                        onChange={(event) => editForm.setData('icon', event.target.files?.[0] ?? null)}
                                    />
                                    {editPackageIconUrl ? (
                                        <S.FieldActions>
                                            <S.IconPreviewLink
                                                href={editPackageIconUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={t('common.open')}
                                                title={t('common.open')}
                                            >
                                                <PackageIcon
                                                    iconUrl={editPackageIconUrl}
                                                    name={packageToEdit.display_name}
                                                    size="sm"
                                                />
                                            </S.IconPreviewLink>
                                        </S.FieldActions>
                                    ) : null}
                                </S.FieldWithActions>
                            </FormField>
                            <FormField label={t('packages.source')}>
                                <S.Select
                                    value={editForm.data.pkg_source}
                                    onChange={(event) => {
                                        const source = event.target.value as 'url' | 'upload';
                                        editForm.setData((data) => ({
                                            ...data,
                                            pkg_source: source,
                                            pkg_url: source === 'upload' ? '' : data.pkg_url,
                                            pkg_file: source === 'url' ? null : data.pkg_file,
                                        }));
                                    }}
                                >
                                    <option value="url">{t('packages.remoteUrl')}</option>
                                    <option value="upload">{t('packages.localUpload')}</option>
                                </S.Select>
                            </FormField>
                            <S.Full>
                                {editForm.data.pkg_source === 'url' ? (
                                    <FormField label={t('packages.pkgUrl')} error={editForm.errors.pkg_url}>
                                        <S.FieldWithActions>
                                            <S.Input
                                                type="url"
                                                value={editForm.data.pkg_url}
                                                onChange={(event) => editForm.setData('pkg_url', event.target.value)}
                                            />
                                            {editPackageRemoteUrl ? (
                                                <S.FieldActions>
                                                    <S.TableIconButton
                                                        as="a"
                                                        href={editPackageRemoteUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={t('common.open')}
                                                        title={t('common.open')}
                                                    >
                                                        <TableIcon name="external" />
                                                    </S.TableIconButton>
                                                </S.FieldActions>
                                            ) : null}
                                        </S.FieldWithActions>
                                    </FormField>
                                ) : (
                                    <FormField label={t('packages.pkgFile')} error={editForm.errors.pkg_file}>
                                        <S.FieldWithActions>
                                            <S.Input
                                                type="file"
                                                accept=".pkg,.dmg"
                                                onChange={(event) => editForm.setData('pkg_file', event.target.files?.[0] ?? null)}
                                            />
                                            {editPackageFileUrl && editPackageDownloadUrl ? (
                                                <S.FieldActions>
                                                    <S.TableIconButton
                                                        as="a"
                                                        href={editPackageDownloadUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                        aria-label={t('common.download')}
                                                        title={t('common.download')}
                                                    >
                                                        <TableIcon name="download" />
                                                    </S.TableIconButton>
                                                </S.FieldActions>
                                            ) : null}
                                        </S.FieldWithActions>
                                    </FormField>
                                )}
                            </S.Full>
                            <S.Full>
                                <FormField label={t('packages.hash')} error={editForm.errors.hash}>
                                    <S.Input
                                        value={editForm.data.hash}
                                        onChange={(event) => editForm.setData('hash', event.target.value)}
                                        placeholder={
                                            editForm.data.pkg_source === 'upload'
                                                ? t('packages.hashAutoPlaceholder')
                                                : t('packages.hashPlaceholder')
                                        }
                                    />
                                </FormField>
                            </S.Full>
                            <S.Full>
                                <S.SwitchLabel>
                                    <S.SwitchInput
                                        type="checkbox"
                                        checked={editForm.data.active}
                                        onChange={(event) => editForm.setData('active', event.target.checked)}
                                    />
                                    <S.SwitchTrack aria-hidden="true">
                                        <S.SwitchThumb />
                                    </S.SwitchTrack>
                                    <S.SwitchText>
                                        <strong>{t('packages.active')}</strong>
                                        <span>{t('packages.activeHelp')}</span>
                                    </S.SwitchText>
                                </S.SwitchLabel>
                            </S.Full>
                            {renderUploadProgress(editUploadProgress)}
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

            {matrixOpen ? (
                <S.ModalOverlay
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setMatrixOpen(false);
                        }
                    }}
                >
                    <S.WideDialog onClick={(event) => event.stopPropagation()}>
                        <S.ModalHeader>
                            <div>
                                <S.ModalTitle>{t('packages.matrixTitle')}</S.ModalTitle>
                                <S.ModalDescription>
                                    {t('packages.matrixDescription')}
                                </S.ModalDescription>
                            </div>
                            <S.IconButton type="button" onClick={() => setMatrixOpen(false)} aria-label={t('common.close')}>
                                ×
                            </S.IconButton>
                        </S.ModalHeader>

                        <S.MatrixControls>
                            <S.SegmentedControl>
                                <S.SegmentButton
                                    type="button"
                                    $active={matrixMode === 'profiles'}
                                    onClick={() => setMatrixMode('profiles')}
                                >
                                    {t('packages.byProfile')}
                                </S.SegmentButton>
                                <S.SegmentButton
                                    type="button"
                                    $active={matrixMode === 'packages'}
                                    onClick={() => setMatrixMode('packages')}
                                >
                                    {t('packages.byPackage')}
                                </S.SegmentButton>
                            </S.SegmentedControl>
                            <S.FilterInput
                                value={matrixSearch}
                                onChange={(event) => setMatrixSearch(event.target.value)}
                                placeholder={t('packages.matrixSearch')}
                            />
                        </S.MatrixControls>

                        <S.TableCard>
                            <S.MatrixTable>
                                {matrixMode === 'profiles' ? (
                                    <>
                                        <thead>
                                            <tr>
                                                <th>{t('packages.profile')}</th>
                                                <th>{t('packages.type')}</th>
                                                <th>{t('packages.identifier')}</th>
                                                <th>{t('common.packages')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profileMatrixRows.length === 0 ? (
                                                <tr>
                                                    <S.EmptyCell colSpan={4}>{t('packages.noProfileAssigned')}</S.EmptyCell>
                                                </tr>
                                            ) : (
                                                profileMatrixRows.map((row) => (
                                                    <tr key={`${row.target.type}:${row.target.id}`}>
                                                        <td>
                                                            <S.TargetTitle>
                                                                <TargetIcon type={row.target.type} />
                                                                <S.PrimaryCell>{row.target.name}</S.PrimaryCell>
                                                            </S.TargetTitle>
                                                        </td>
                                                        <td>{row.target.type === 'group' ? t('common.group') : t('common.person')}</td>
                                                        <td>{row.target.identifier ? <S.CodePill>{row.target.identifier}</S.CodePill> : '-'}</td>
                                                        <td>
                                                            <S.AssignmentPills>
                                                                {row.assignments.map((assignment) => (
                                                                    <S.AssignmentPill
                                                                        key={`${assignment.package.id}:${assignment.action}`}
                                                                        $action={assignment.action}
                                                                    >
                                                                        <S.InlinePackage>
                                                                            {assignment.action === 'install' ? '+' : '-'}
                                                                            <PackageIcon
                                                                                iconUrl={assignment.package.icon_url}
                                                                                name={assignment.package.display_name}
                                                                                size="sm"
                                                                            />
                                                                            {assignment.package.display_name}
                                                                        </S.InlinePackage>
                                                                    </S.AssignmentPill>
                                                                ))}
                                                            </S.AssignmentPills>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead>
                                            <tr>
                                                <th>{t('assignments.package')}</th>
                                                <th>{t('packages.munkiName')}</th>
                                                <th>{t('packages.profile')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packageMatrixRows.length === 0 ? (
                                                <tr>
                                                    <S.EmptyCell colSpan={3}>{t('packages.noMatrixPackage')}</S.EmptyCell>
                                                </tr>
                                            ) : (
                                                packageMatrixRows.map((row) => (
                                                    <tr key={row.package.id}>
                                                        <td>
                                                            <S.PackageTitle>
                                                                <PackageIcon iconUrl={row.package.icon_url} name={row.package.display_name} />
                                                                <S.PrimaryCell>{row.package.display_name}</S.PrimaryCell>
                                                            </S.PackageTitle>
                                                        </td>
                                                        <td>
                                                            <S.CodePill>{row.package.munki_name}</S.CodePill>
                                                        </td>
                                                        <td>
                                                            {row.profiles.length === 0 ? (
                                                                <S.Meta>{t('packages.noProfile')}</S.Meta>
                                                            ) : (
                                                                <S.AssignmentPills>
                                                                    {row.profiles.map((assignment) => (
                                                                        <S.AssignmentPill
                                                                            key={assignment.id}
                                                                            $action={assignment.action}
                                                                        >
                                                                            {assignment.action === 'install' ? '+' : '-'}{' '}
                                                                            <S.InlineTarget>
                                                                                {assignment.target.type === 'group' ? t('common.group') : t('common.person')}
                                                                                <TargetIcon type={assignment.target.type} />
                                                                                {assignment.target.name}
                                                                            </S.InlineTarget>
                                                                        </S.AssignmentPill>
                                                                    ))}
                                                                </S.AssignmentPills>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </>
                                )}
                            </S.MatrixTable>
                        </S.TableCard>
                    </S.WideDialog>
                </S.ModalOverlay>
            ) : null}

            <S.FilterBar>
                <div>
                    <S.FilterTitle>{t('packages.listTitle')}</S.FilterTitle>
                    <S.FilterMeta>{t('people.displayed', { count: filteredPackages.length })}</S.FilterMeta>
                </div>
                <S.FilterControls>
                    {canUpdatePackages && selectedPackageIds.length > 0 ? (
                        <S.DangerButton type="button" onClick={() => setBulkDeleteOpen(true)}>
                            {t('common.bulkDelete', { count: selectedPackageIds.length })}
                        </S.DangerButton>
                    ) : null}
                    <S.FilterControl>
                        <span>{t('common.search')}</span>
                        <S.FilterInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('packages.searchPlaceholder')}
                        />
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>{t('packages.source')}</span>
                        <S.FilterSelect value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                            <option value="all">{t('packages.allSources')}</option>
                            <option value="uploaded">{t('packages.sourceUploaded')}</option>
                            <option value="remote">{t('packages.sourceRemote')}</option>
                        </S.FilterSelect>
                    </S.FilterControl>
                    <S.FilterControl>
                        <span>{t('packages.status')}</span>
                        <S.FilterSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">{t('packages.allStatuses')}</option>
                            <option value="active">{t('packages.activeStatus')}</option>
                            <option value="inactive">{t('packages.inactiveStatus')}</option>
                        </S.FilterSelect>
                    </S.FilterControl>
                </S.FilterControls>
            </S.FilterBar>

            <S.TableCard>
                <S.Table>
                    <thead>
                        <tr>
                            {canUpdatePackages ? (
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allVisiblePackagesSelected}
                                        aria-label={t('common.selectAll')}
                                        onChange={toggleVisiblePackagesSelection}
                                    />
                                </th>
                            ) : null}
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('display_name')}>
                                    {t('assignments.package')}{sortIndicator('display_name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('munki_name')}>
                                    {t('packages.munkiName')}{sortIndicator('munki_name')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('bundle_identifier')}>
                                    {t('packages.bundleIdentifier')}{sortIndicator('bundle_identifier')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('version')}>
                                    {t('packages.version')}{sortIndicator('version')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('source')}>
                                    {t('packages.source')}{sortIndicator('source')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('active')}>
                                    {t('packages.status')}{sortIndicator('active')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('assignments_count')}>
                                    {t('packages.assignmentCount')}{sortIndicator('assignments_count')}
                                </S.SortButton>
                            </th>
                            <th>
                                <S.SortButton type="button" onClick={() => changeSort('hash')}>
                                    {t('packages.hashHeader')}{sortIndicator('hash')}
                                </S.SortButton>
                            </th>
                            {canUpdatePackages ? <th>{t('common.actions')}</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackages.length === 0 ? (
                            <tr>
                                <S.EmptyCell colSpan={canUpdatePackages ? 10 : 8}>{t('packages.noMatch')}</S.EmptyCell>
                            </tr>
                        ) : (
                            filteredPackages.map((pkg) => (
                                <tr key={pkg.id}>
                                    {canUpdatePackages ? (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedPackageIds.includes(pkg.id)}
                                                aria-label={t('common.selectRow')}
                                                onChange={() => togglePackageSelection(pkg.id)}
                                            />
                                        </td>
                                    ) : null}
                                    <td>
                                        <S.PackageTitle>
                                            <PackageIcon iconUrl={pkg.icon_url} name={pkg.display_name} />
                                            <S.PackageTitleText>
                                                <S.PrimaryCell>{pkg.display_name}</S.PrimaryCell>
                                            </S.PackageTitleText>
                                        </S.PackageTitle>
                                    </td>
                                    <td>
                                        <S.CodePill>{pkg.munki_name}</S.CodePill>
                                    </td>
                                    <td>{pkg.bundle_identifier ? <S.CodePill>{pkg.bundle_identifier}</S.CodePill> : '-'}</td>
                                    <td>
                                        {pkg.version ? <S.VersionText>{pkg.version}</S.VersionText> : '-'}
                                    </td>
                                    <td>
                                        <S.SourceBadge $source={pkg.pkg_path ? 'uploaded' : 'remote'}>
                                            {pkg.pkg_path ? t('packages.sourceUploaded') : t('packages.sourceRemote')}
                                        </S.SourceBadge>
                                    </td>
                                    <td>
                                        <S.StatusBadge $active={pkg.active}>
                                            {pkg.active ? t('packages.activeStatus') : t('packages.inactiveStatus')}
                                        </S.StatusBadge>
                                    </td>
                                    <td>{pkg.assignments_count ?? 0}</td>
                                    <td>
                                        <S.HashText>{pkg.hash}</S.HashText>
                                    </td>
                                    {canUpdatePackages ? (
                                        <td>
                                            <S.RowActions>
                                                <S.TableIconButton
                                                    type="button"
                                                    aria-label={t('common.edit')}
                                                    title={t('common.edit')}
                                                    onClick={() => openEditModal(pkg)}
                                                >
                                                    <TableIcon name="edit" />
                                                </S.TableIconButton>
                                                <S.TableIconButton
                                                    type="button"
                                                    $tone="danger"
                                                    aria-label={t('common.delete')}
                                                    title={t('common.delete')}
                                                    onClick={() => setPackageToDelete(pkg)}
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
            {canUpdatePackages ? <ConfirmModal
                open={packageToDelete !== null}
                title={t('packages.deleteTitle')}
                description={
                    packageToDelete
                        ? t('packages.deleteDescription', { name: packageToDelete.display_name })
                        : ''
                }
                onClose={() => setPackageToDelete(null)}
                onConfirm={() => {
                    if (!packageToDelete) {
                        return;
                    }

                    router.delete(`/packages/${packageToDelete.id}`, {
                        onFinish: () => setPackageToDelete(null),
                    });
                }}
            /> : null}
            {canUpdatePackages ? <ConfirmModal
                open={bulkDeleteOpen}
                title={t('packages.bulkDeleteTitle')}
                description={t('packages.bulkDeleteDescription', { count: selectedPackageIds.length })}
                requireConfirmationCheckbox
                confirmationLabel={t('common.confirmBulkDelete')}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={() => {
                    router.delete('/packages/bulk', {
                        data: { ids: selectedPackageIds },
                        onFinish: () => {
                            setBulkDeleteOpen(false);
                            setSelectedPackageIds([]);
                        },
                    });
                }}
            /> : null}
        </S.PackagesManagerContainer>
    );
}
