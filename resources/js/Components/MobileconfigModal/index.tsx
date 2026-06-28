import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import * as S from './styled';

type MobileconfigModalProps = {
    open: boolean;
    title: string;
    description: string;
    previewUrl: string;
    downloadUrl: string;
    shareUrl: string;
    onClose: () => void;
};

type PreviewResponse = {
    content: string;
    file_name: string;
};

type ShareResponse = {
    url: string;
    expires_at: string | null;
};

export default function MobileconfigModal({
    open,
    title,
    description,
    previewUrl,
    downloadUrl,
    shareUrl,
    onClose,
}: MobileconfigModalProps) {
    const { t } = useI18n();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expiresIn, setExpiresIn] = useState('never');
    const [shareLink, setShareLink] = useState('');
    const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLoading(true);
        setError('');
        setShareLink('');
        setShareExpiresAt(null);
        setCopied(false);

        fetch(previewUrl, { headers: { Accept: 'application/json' } })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Preview request failed');
                }

                return response.json() as Promise<PreviewResponse>;
            })
            .then((data) => setContent(data.content))
            .catch(() => setError(t('mobileconfig.previewError')))
            .finally(() => setLoading(false));
    }, [open, previewUrl, t]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    function publish() {
        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        setPublishing(true);
        setError('');

        fetch(shareUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
            },
            body: JSON.stringify({ expires_in: expiresIn }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Share request failed');
                }

                return response.json() as Promise<ShareResponse>;
            })
            .then((data) => {
                setShareLink(data.url);
                setShareExpiresAt(data.expires_at);
            })
            .catch(() => setError(t('mobileconfig.shareError')))
            .finally(() => setPublishing(false));
    }

    function copyShareLink() {
        if (!shareLink) {
            return;
        }

        void navigator.clipboard?.writeText(shareLink).then(() => {
            setCopied(true);
        });
    }

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = window.setTimeout(() => setCopied(false), 2400);

        return () => window.clearTimeout(timeout);
    }, [copied]);

    return (
        <S.Overlay
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <S.Dialog onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <S.Header>
                    <div>
                        <S.Title>{title}</S.Title>
                        <S.Description>{description}</S.Description>
                        <S.Description>{t('mobileconfig.help')}</S.Description>
                    </div>
                    <S.IconButton type="button" onClick={onClose} aria-label={t('common.close')}>
                        ×
                    </S.IconButton>
                </S.Header>

                {loading ? (
                    <S.EmptyState>{t('mobileconfig.loading')}</S.EmptyState>
                ) : error ? (
                    <S.EmptyState>{error}</S.EmptyState>
                ) : (
                    <S.Preview>
                        <code>{content}</code>
                    </S.Preview>
                )}

                <S.ShareBox>
                    <S.ShareControls>
                        <S.ShareLabel>
                            <span>{t('mobileconfig.expiration')}</span>
                            <S.Select value={expiresIn} onChange={(event) => setExpiresIn(event.target.value)}>
                                <option value="never">{t('mobileconfig.neverExpires')}</option>
                                <option value="1d">{t('mobileconfig.expiresInOneDay')}</option>
                                <option value="7d">{t('mobileconfig.expiresInSevenDays')}</option>
                                <option value="30d">{t('mobileconfig.expiresInThirtyDays')}</option>
                            </S.Select>
                        </S.ShareLabel>
                        <S.Button type="button" onClick={publish} disabled={publishing}>
                            {publishing ? t('mobileconfig.publishing') : t('mobileconfig.share')}
                        </S.Button>
                    </S.ShareControls>

                    {shareLink ? (
                        <div>
                            <S.ShareLink value={shareLink} readOnly onFocus={(event) => event.target.select()} />
                            <S.Description>
                                {shareExpiresAt
                                    ? t('mobileconfig.shareExpiresAt', { date: new Date(shareExpiresAt).toLocaleString() })
                                    : t('mobileconfig.permanentLink')}
                            </S.Description>
                        </div>
                    ) : null}
                </S.ShareBox>

                <S.Actions>
                    {shareLink ? (
                        <S.Button type="button" onClick={copyShareLink}>
                            {t('mobileconfig.copyLink')}
                        </S.Button>
                    ) : null}
                    <S.SecondaryButton href={downloadUrl} target="_blank" rel="noreferrer">
                        {t('common.open')}
                    </S.SecondaryButton>
                    <S.SecondaryButton href={downloadUrl} target="_blank" rel="noreferrer" download>
                        {t('common.download')}
                    </S.SecondaryButton>
                    <S.Button type="button" onClick={onClose}>
                        {t('common.close')}
                    </S.Button>
                </S.Actions>
            </S.Dialog>
            {copied ? <S.Toast role="status">{t('mobileconfig.copied')}</S.Toast> : null}
        </S.Overlay>
    );
}
