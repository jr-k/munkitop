import { Head, useForm, usePage } from '@inertiajs/react';
import FormField from '../../Components/FormField';
import LogoMark from '../../Components/LogoMark';
import { useI18n } from '../../i18n';
import { PageProps } from '../../types';
import * as S from '../Login/styled';

export default function Onboarding() {
    const { t } = useI18n();
    const { props } = usePage<PageProps>();
    const displayName = props.app.display_name;
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/onboarding');
    }

    return (
        <S.LoginContainer>
            <Head title={t('onboarding.title')} />
            <S.Panel onSubmit={submit}>
                <S.Brand>
                    <LogoMark size={42} />
                    <S.Title>{displayName}</S.Title>
                </S.Brand>
                <S.Help>{t('onboarding.help')}</S.Help>
                <FormField label={t('onboarding.name')} error={form.errors.name}>
                    <S.Input
                        value={form.data.name}
                        autoComplete="name"
                        onChange={(event) => form.setData('name', event.target.value)}
                    />
                </FormField>
                <FormField label="Email" error={form.errors.email}>
                    <S.Input
                        type="email"
                        value={form.data.email}
                        autoComplete="email"
                        onChange={(event) => form.setData('email', event.target.value)}
                    />
                </FormField>
                <FormField label={t('login.password')} error={form.errors.password}>
                    <S.Input
                        type="password"
                        value={form.data.password}
                        autoComplete="new-password"
                        onChange={(event) => form.setData('password', event.target.value)}
                    />
                </FormField>
                <FormField label={t('onboarding.passwordConfirmation')} error={form.errors.password_confirmation}>
                    <S.Input
                        type="password"
                        value={form.data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                    />
                </FormField>
                <S.Button type="submit" disabled={form.processing}>
                    {t('onboarding.submit')}
                </S.Button>
            </S.Panel>
        </S.LoginContainer>
    );
}
