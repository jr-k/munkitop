import { useI18n } from '../../i18n';
import type { FlashMessagePayload } from '../../types';
import * as S from './styled';

type FlashMessageProps = {
    message?: FlashMessagePayload;
    tone: 'success' | 'error';
};

export default function FlashMessage({ message, tone }: FlashMessageProps) {
    const { t } = useI18n();

    if (!message) {
        return null;
    }

    const text = typeof message === 'string' ? message : t(message.key, message.params);

    return <S.FlashMessageContainer $tone={tone}>{text}</S.FlashMessageContainer>;
}
