import { PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { useI18n } from '../../i18n';
import * as S from './styled';

type AppLayoutProps = PropsWithChildren<{
    adminEmail: string;
}>;

export default function AppLayout({ adminEmail, children }: AppLayoutProps) {
    const { locale, setLocale, t } = useI18n();

    return (
        <S.AppLayoutContainer>
            <S.Header>
                <S.Brand>
                    <S.Title>Munki My Admin</S.Title>
                    <S.Subtitle>{t('layout.signedIn', { email: adminEmail })}</S.Subtitle>
                </S.Brand>
                <S.HeaderActions>
                    <S.NavLink href="/people">{t('common.people')}</S.NavLink>
                    <S.NavLink href="/groups">{t('common.groups')}</S.NavLink>
                    <S.NavLink href="/packages">{t('common.packages')}</S.NavLink>
                    <S.NavLink href="/assignments">{t('common.assignments')}</S.NavLink>
                    <S.NavLink href="/munki">{t('common.export')}</S.NavLink>
                    <S.LanguageSelect
                        aria-label={t('layout.language')}
                        value={locale}
                        onChange={(event) => setLocale(event.target.value as 'en' | 'fr')}
                    >
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                    </S.LanguageSelect>
                    <S.LogoutButton type="button" onClick={() => router.post('/logout')}>
                        {t('layout.logout')}
                    </S.LogoutButton>
                </S.HeaderActions>
            </S.Header>
            <S.Main>{children}</S.Main>
        </S.AppLayoutContainer>
    );
}
