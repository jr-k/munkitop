import { PropsWithChildren } from 'react';
import * as S from './styled';

type CardProps = PropsWithChildren<{
    title: string;
    description?: string;
}>;

export default function Card({ title, description, children }: CardProps) {
    return (
        <S.CardContainer>
            <S.Header>
                <S.Title>{title}</S.Title>
                {description ? <S.Description>{description}</S.Description> : null}
            </S.Header>
            {children}
        </S.CardContainer>
    );
}
