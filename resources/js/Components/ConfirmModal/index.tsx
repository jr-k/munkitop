import { useEffect } from 'react';
import { useI18n } from '../../i18n';
import * as S from './styled';

type ConfirmModalProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const { t } = useI18n();

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

    return (
        <S.Overlay
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <S.Dialog role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(event) => event.stopPropagation()}>
                <S.Icon aria-hidden="true">!</S.Icon>
                <S.Content>
                    <S.Title id="confirm-modal-title">{title}</S.Title>
                    <S.Description>{description}</S.Description>
                </S.Content>
                <S.Actions>
                    <S.CancelButton type="button" onClick={onClose}>
                        {cancelLabel ?? t('common.cancel')}
                    </S.CancelButton>
                    <S.ConfirmButton type="button" onClick={onConfirm}>
                        {confirmLabel ?? t('common.delete')}
                    </S.ConfirmButton>
                </S.Actions>
            </S.Dialog>
        </S.Overlay>
    );
}
