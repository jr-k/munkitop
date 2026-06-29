import { PropsWithChildren } from 'react';
import { router, usePage } from '@inertiajs/react';
import LogoMark from '../LogoMark';
import { useI18n } from '../../i18n';
import { can } from '../../permissions';
import { PageProps } from '../../types';
import * as S from './styled';

type AppLayoutProps = PropsWithChildren<{
    adminEmail?: string;
}>;

export default function AppLayout({ adminEmail, children }: AppLayoutProps) {
    const { locale, setLocale, t } = useI18n();
    const { props, url } = usePage<PageProps>();
    const displayName = props.app.display_name;
    const version = props.app.version;
    const signedInEmail = adminEmail ?? props.auth.user?.email ?? 'admin';
    const sections = [
        {
            title: t('layout.directorySection'),
            links: [
                { href: '/people', label: t('common.people'), visible: can(props, 'people', 'read') },
                { href: '/groups', label: t('common.groups'), visible: can(props, 'groups', 'read') },
                { href: '/links', label: t('common.links'), visible: can(props, 'links', 'read') },
            ].filter((link) => link.visible),
        },
        {
            title: t('layout.softwareSection'),
            links: [
                { href: '/packages', label: t('common.packages'), visible: can(props, 'packages', 'read') },
            ].filter((link) => link.visible),
        },
        {
            title: t('layout.deploymentSection'),
            links: [
                { href: '/assignments', label: t('common.assignments'), visible: can(props, 'assignments', 'read') },
                { href: '/munki', label: t('common.export'), visible: can(props, 'export') },
            ].filter((link) => link.visible),
        },
        {
            title: t('layout.administrationSection'),
            links: [
                { href: '/users', label: t('common.users'), visible: can(props, 'users', 'manage') },
            ].filter((link) => link.visible),
        },
    ].filter((section) => section.links.length > 0);

    return (
        <S.AppLayoutContainer>
            <S.Sidebar>
                <S.Brand>
                    <LogoMark />
                    <div>
                        <S.Title>{displayName}</S.Title>
                    </div>
                </S.Brand>

                <S.Navigation aria-label="Main navigation">
                    {sections.map((section) => (
                        <S.NavSection key={section.title}>
                            <S.SectionTitle>{section.title}</S.SectionTitle>
                            {section.links.map((link) => (
                                <S.NavLink key={link.href} href={link.href} $active={url.startsWith(link.href)}>
                                    {link.label}
                                </S.NavLink>
                            ))}
                        </S.NavSection>
                    ))}
                </S.Navigation>

                <S.SidebarFooter>
                    <S.LanguageSwitcher aria-label={t('layout.language')}>
                        <S.LanguageButton
                            type="button"
                            $active={locale === 'en'}
                            onClick={() => setLocale('en')}
                            aria-label="English"
                            title="English"
                        >
                            <span aria-hidden="true">🇬🇧</span>
                            EN
                        </S.LanguageButton>
                        <S.LanguageButton
                            type="button"
                            $active={locale === 'fr'}
                            onClick={() => setLocale('fr')}
                            aria-label="Français"
                            title="Français"
                        >
                            <span aria-hidden="true">🇫🇷</span>
                            FR
                        </S.LanguageButton>
                    </S.LanguageSwitcher>
                    <S.UserFooter>
                        <S.SignedIn>
                            <span>{t('layout.connectedAs')}</span>
                            <S.SignedInEmail>{signedInEmail}</S.SignedInEmail>
                        </S.SignedIn>
                        <S.LogoutButton type="button" onClick={() => router.post('/logout')} aria-label={t('layout.logout')} title={t('layout.logout')}>
                            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
                                <path d="M10 6H6v12h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                <path d="M14 8l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                <path d="M18 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </S.LogoutButton>
                    </S.UserFooter>
                    <S.ProjectMeta>
                        <S.GitHubLink href="https://github.com/jr-k/munkitop" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
                            <svg aria-hidden="true" fill="currentColor" height="17" viewBox="0 0 24 24" width="17">
                                <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.8 0 0 .8-.3 2.8 1.1.8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.4 2.8-1.1 2.8-1.1.5 1.5.2 2.5.1 2.8.6.8 1 1.7 1 2.8 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5 4-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2Z" />
                            </svg>
                            <span>v{version}</span>
                        </S.GitHubLink>
                    </S.ProjectMeta>
                </S.SidebarFooter>
            </S.Sidebar>
            <S.Main>{children}</S.Main>
        </S.AppLayoutContainer>
    );
}
