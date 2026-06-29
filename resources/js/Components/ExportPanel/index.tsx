import { router, useForm } from '@inertiajs/react';
import { useI18n } from '../../i18n';
import * as S from './styled';

type ExportPanelProps = {
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

export default function ExportPanel({ munki }: ExportPanelProps) {
    const { t } = useI18n();
    const form = useForm({
        override: munki.externalUrl.override,
        url: munki.externalUrl.url,
    });
    const effectiveBaseUrl = form.data.override ? form.data.url : munki.externalUrl.defaultUrl;
    const effectiveRepoUrl = `${effectiveBaseUrl.replace(/\/$/, '')}/repo`;
    const repoLinkUrl = form.isDirty ? effectiveRepoUrl : munki.repoUrl;

    function submitSettings(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put('/munki/settings', {
            preserveScroll: true,
        });
    }

    return (
        <S.ExportPanelContainer>
            <S.Hero>
                <S.Content>
                    <S.Title>{t('munki.title')}</S.Title>
                    <S.Meta>
                        {t('munki.repoMeta', {
                            repoPath: munki.repoPath,
                            repoUrl: repoLinkUrl,
                            catalog: munki.catalog,
                            baseManifest: munki.baseManifest,
                        })}
                    </S.Meta>
                </S.Content>
                <S.HeroActions>
                    <S.RepoLink href={repoLinkUrl} target="_blank" rel="noreferrer">
                        {t('munki.openRepo')}
                    </S.RepoLink>
                    <S.Button type="button" onClick={() => router.post('/munki/export')}>
                        {t('munki.generate')}
                    </S.Button>
                </S.HeroActions>
            </S.Hero>

            <S.Instructions as="form" onSubmit={submitSettings}>
                <S.SectionTitle>{t('munki.externalUrlTitle')}</S.SectionTitle>
                <S.Text>
                    {t('munki.externalUrlHelp', { defaultUrl: munki.externalUrl.defaultUrl })}
                </S.Text>
                <S.SwitchLabel>
                    <S.SwitchInput
                        type="checkbox"
                        checked={form.data.override}
                        onChange={(event) => form.setData('override', event.target.checked)}
                    />
                    <S.SwitchTrack aria-hidden="true">
                        <S.SwitchThumb />
                    </S.SwitchTrack>
                    <S.SwitchText>
                        <strong>{t('munki.overrideExternalUrl')}</strong>
                        <span>{t('munki.overrideExternalUrlHelp')}</span>
                    </S.SwitchText>
                </S.SwitchLabel>
                <S.UrlField>
                    <S.UrlLabel>{t('munki.externalUrlLabel')}</S.UrlLabel>
                    <S.UrlInput
                        type="url"
                        value={form.data.url}
                        disabled={!form.data.override}
                        onChange={(event) => form.setData('url', event.target.value)}
                        placeholder={munki.externalUrl.defaultUrl}
                    />
                    {form.errors.url ? <S.ErrorText>{form.errors.url}</S.ErrorText> : null}
                    <S.UrlHint>{t('munki.effectiveRepoUrl', { repoUrl: effectiveRepoUrl })}</S.UrlHint>
                </S.UrlField>
                <S.SettingsActions>
                    <S.SecondaryButton
                        type="button"
                        onClick={() => {
                            form.setData({
                                override: false,
                                url: munki.externalUrl.defaultUrl,
                            });
                        }}
                    >
                        {t('munki.useDefaultUrl')}
                    </S.SecondaryButton>
                    <S.Button type="submit" disabled={form.processing}>
                        {t('common.save')}
                    </S.Button>
                </S.SettingsActions>
            </S.Instructions>

            <S.Instructions>
                <S.SectionTitle>{t('munki.clientConfig')}</S.SectionTitle>
                <S.Text>
                    {t('munki.clientConfigText')}
                </S.Text>

                <S.Steps>
                    <S.Step>
                        <strong>{t('munki.stepExport')}</strong>
                        <span>{t('munki.stepExportText')}</span>
                    </S.Step>
                    <S.Step>
                        <strong>{t('munki.stepMobileconfig')}</strong>
                        <span>{t('munki.stepMobileconfigText')}</span>
                    </S.Step>
                    <S.Step>
                        <strong>{t('munki.stepShare')}</strong>
                        <span>{t('munki.stepShareText')}</span>
                    </S.Step>
                    <S.Step>
                        <strong>{t('munki.stepInstall')}</strong>
                        <span>
                            {t('munki.stepInstallText')}{' '}
                            <a href="https://github.com/macadmins/munki-builds/releases" target="_blank" rel="noreferrer">
                                {t('munki.clientDownloadLink')}
                            </a>
                            .
                        </span>
                    </S.Step>
                </S.Steps>
            </S.Instructions>

        </S.ExportPanelContainer>
    );
}
