import { PropsWithChildren } from 'react';
import * as S from './styled';

type FormFieldProps = PropsWithChildren<{
    label: string;
    error?: string;
}>;

export default function FormField({ label, error, children }: FormFieldProps) {
    return (
        <S.FormFieldContainer>
            <S.Label>{label}</S.Label>
            <S.Control>{children}</S.Control>
            {error ? <S.Error>{error}</S.Error> : null}
        </S.FormFieldContainer>
    );
}
