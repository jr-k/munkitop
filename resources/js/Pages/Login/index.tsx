import { Head, useForm, usePage } from '@inertiajs/react';
import FlashMessage from '../../Components/FlashMessage';
import FormField from '../../Components/FormField';
import LogoMark from '../../Components/LogoMark';
import { useI18n } from '../../i18n';
import { PageProps } from '../../types';
import * as S from './styled';

export default function Login() {
    const { t } = useI18n();
    const { props } = usePage<PageProps>();
    const displayName = props.app.display_name;
    const form = useForm({
        email: '',
        password: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/login');
    }

    return (
        <S.LoginContainer>
            <Head title={t('login.title')} />
            <S.Panel onSubmit={submit}>
                <S.Brand>
                    <LogoMark size={42} />
                    <S.Title>{displayName}</S.Title>
                </S.Brand>
                <S.Help>{t('login.help')}</S.Help>
                <FlashMessage message={props.flash.success} tone="success" />
                <FlashMessage message={props.flash.error} tone="error" />
                <FormField label="Email" error={form.errors.email}>
                    <S.Input
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                    />
                </FormField>
                <FormField label={t('login.password')} error={form.errors.password}>
                    <S.Input
                        type="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                    />
                </FormField>
                <S.Button type="submit" disabled={form.processing}>
                    {t('login.submit')}
                </S.Button>
                <S.LinkRow>
                    <S.TextLink href="/forgot-password">{t('login.forgotPassword')}</S.TextLink>
                </S.LinkRow>
            </S.Panel>
        </S.LoginContainer>
    );
}
