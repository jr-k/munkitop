import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import ExportPanel from '../../Components/ExportPanel';
import FlashMessage from '../../Components/FlashMessage';
import { useI18n } from '../../i18n';
import { PageProps } from '../../types';

type MunkiPageProps = PageProps & {
    munki: {
        repoPath: string;
        repoUrl: string;
        externalUrl: {
            override: boolean;
            url: string;
            defaultUrl: string;
        };
        catalog: string;
        baseManifest: string;
    };
};

export default function Munki({ munki }: MunkiPageProps) {
    const { props } = usePage<MunkiPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.user?.email ?? 'admin';

    return (
        <>
            <Head title={t('munki.title')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <ExportPanel munki={munki} />
            </AppLayout>
        </>
    );
}
