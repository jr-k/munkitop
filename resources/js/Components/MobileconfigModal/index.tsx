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
    canShare?: boolean;
    onClose: () => void;
};

type PreviewResponse = {
    content: string;
    file_name: string;
};

type ShareResponse = {
    ulid: string;
    url: string;
    expires_at: string | null;
    recipient_email: string | null;
};

type EmailResponse = {
    sent: boolean;
};

export default function MobileconfigModal({
    open,
    title,
    description,
    previewUrl,
    downloadUrl,
    shareUrl,
    canShare = false,
    onClose,
}: MobileconfigModalProps) {
    const { t } = useI18n();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expiresIn, setExpiresIn] = useState('never');
    const [shareUlid, setShareUlid] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        setLoading(true);
        setError('');
        setShareUlid('');
        setShareLink('');
        setShareExpiresAt(null);
        setCopied(false);
        setRecipientEmail('');
        setSendingEmail(false);
        setEmailSent(false);
        setEmailError('');

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
        setEmailSent(false);
        setEmailError('');

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
                setShareUlid(data.ulid);
                setShareLink(data.url);
                setShareExpiresAt(data.expires_at);
                setRecipientEmail(data.recipient_email ?? '');
            })
            .catch(() => setError(t('mobileconfig.shareError')))
            .finally(() => setPublishing(false));
    }

    function sendShareEmail() {
        if (!shareUlid || !recipientEmail.trim()) {
            return;
        }

        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        setSendingEmail(true);
        setEmailSent(false);
        setEmailError('');

        fetch(`/links/${shareUlid}/email`, {
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

                {canShare ? (
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
                        <S.ShareResult>
                            <S.ShareLink value={shareLink} readOnly onFocus={(event) => event.target.select()} />
                            <S.Description>
                                {shareExpiresAt
                                    ? t('mobileconfig.shareExpiresAt', { date: new Date(shareExpiresAt).toLocaleString() })
                                    : t('mobileconfig.permanentLink')}
                            </S.Description>
                        </S.ShareResult>
                    ) : null}

                    {shareLink ? (
                        <S.EmailBox>
                            <S.EmailHeader>
                                <S.EmailIcon aria-hidden="true">✉</S.EmailIcon>
                                <div>
                                    <S.EmailTitle>{t('mobileconfig.emailTitle')}</S.EmailTitle>
                                    <S.Description>{t('mobileconfig.emailDescription')}</S.Description>
                                </div>
                            </S.EmailHeader>
                            <S.EmailControls>
                                <S.EmailLabel>
                                    <span>{t('mobileconfig.recipientEmail')}</span>
                                    <S.EmailInput
                                        type="email"
                                        value={recipientEmail}
                                        placeholder={t('mobileconfig.recipientEmailPlaceholder')}
                                        onChange={(event) => {
                                            setRecipientEmail(event.target.value);
                                            setEmailSent(false);
                                            setEmailError('');
                                        }}
                                    />
                                </S.EmailLabel>
                                <S.Button
                                    type="button"
                                    onClick={sendShareEmail}
                                    disabled={sendingEmail || !recipientEmail.trim()}
                                >
                                    {sendingEmail ? t('mobileconfig.emailSending') : t('mobileconfig.emailSend')}
                                </S.Button>
                            </S.EmailControls>
                            {emailSent ? (
                                <S.EmailStatus role="status">
                                    {t('mobileconfig.emailSent', { email: recipientEmail.trim() })}
                                </S.EmailStatus>
                            ) : null}
                            {emailError ? <S.EmailError role="alert">{emailError}</S.EmailError> : null}
                        </S.EmailBox>
                    ) : null}
                    </S.ShareBox>
                ) : null}

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
