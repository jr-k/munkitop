import type { TranslationKey } from './i18n';

export type FlashMessagePayload =
    | string
    | {
        key: TranslationKey;
        params?: Record<string, string | number>;
    };

export type Group = {
    id: number;
    name: string;
    slug: string;
    notes: string | null;
    is_system: boolean;
    manifest?: ManifestPreview;
    people_count?: number;
    people?: Person[];
};

export type Person = {
    id: number;
    name: string;
    first_name: string | null;
    email: string;
    client_identifier: string;
    notes: string | null;
    groups: Group[];
    manifest: ManifestPreview;
};

export type Package = {
    id: number;
    munki_name: string;
    display_name: string;
    category: string | null;
    description: string | null;
    bundle_identifier: string | null;
    version: string | null;
    icon_path: string | null;
    icon_url: string | null;
    pkg_path: string | null;
    pkg_file_url: string | null;
    hash: string;
    pkg_url: string | null;
    active: boolean;
    assignments_count?: number;
    assignments?: PackageAssignment[];
};

export type PackageAssignment = {
    id: number;
    action: 'install' | 'uninstall';
    target: {
        id: number | null;
        type: 'person' | 'group';
        name: string | null;
        identifier: string | null;
    };
};

export type Assignment = {
    id: number;
    action: 'install' | 'uninstall';
    package: {
        id: number | null;
        name: string | null;
        munki_name: string | null;
        icon_url: string | null;
    };
    target: {
        id: number | null;
        type: 'person' | 'group';
        name: string | null;
        identifier: string | null;
    };
};

export type ManifestPreview = {
    path: string;
    url: string;
    content: string | null;
};

export type MobileconfigShare = {
    id: number;
    ulid: string;
    url: string;
    target: {
        type: 'person' | 'group' | 'missing';
        id: number | null;
        name: string | null;
        identifier: string | null;
        email?: string | null;
    };
    expires_at: string | null;
    expired: boolean;
    created_at: string | null;
};

export type UserRole = 'owner' | 'admin' | 'user';

export type PermissionResource = 'people' | 'groups' | 'links' | 'packages' | 'assignments';

export type PermissionAction = 'read' | 'update';

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_owner: boolean;
    permissions: string[];
    created_at: string | null;
    last_login_at: string | null;
};

export type PageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: UserRole;
            is_owner: boolean;
        } | null;
        permissions: string[];
        isAdmin: boolean;
        isOwner: boolean;
    };
    app: {
        display_name: string;
        version: string;
    };
    flash: {
        success?: FlashMessagePayload;
        error?: FlashMessagePayload;
    };
};
