import { Icon } from '@iconify/react';
import * as S from './styled';

type TargetIconProps = {
    type: 'group' | 'person';
};

export default function TargetIcon({ type }: TargetIconProps) {
    return (
        <S.IconFrame $type={type} aria-hidden="true">
            <Icon icon={type === 'group' ? 'mdi:account-group' : 'mdi:account'} height={18} width={18} />
        </S.IconFrame>
    );
}
