import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import FlashMessage from '../../Components/FlashMessage';
import PackagesManager from '../../Components/PackagesManager';
import { useI18n } from '../../i18n';
import { Package, PageProps } from '../../types';

type PackagesPageProps = PageProps & {
    packages: Package[];
};

export default function Packages({ packages }: PackagesPageProps) {
    const { props } = usePage<PackagesPageProps>();
    const { t } = useI18n();
    const adminEmail = props.auth.user?.email ?? 'admin';

    return (
        <>
            <Head title={t('common.packages')} />
            <AppLayout adminEmail={adminEmail}>
                <FlashMessage tone="success" message={props.flash.success} />
                <FlashMessage tone="error" message={props.flash.error} />
                <PackagesManager packages={packages} />
            </AppLayout>
        </>
    );
}
