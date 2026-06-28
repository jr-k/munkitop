import { useEffect, useState } from 'react';
import * as S from './styled';

type PackageIconProps = {
    iconUrl?: string | null;
    name: string;
    size?: 'sm' | 'md';
};

export default function PackageIcon({ iconUrl, name, size = 'md' }: PackageIconProps) {
    const [failed, setFailed] = useState(false);
    const initial = name.trim().charAt(0).toUpperCase();

    useEffect(() => {
        setFailed(false);
    }, [iconUrl]);

    return (
        <S.IconFrame $size={size} aria-hidden="true">
            {iconUrl && !failed ? <S.IconImage alt="" src={iconUrl} onError={() => setFailed(true)} /> : initial}
        </S.IconFrame>
    );
}
