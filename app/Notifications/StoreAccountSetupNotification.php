<?php

namespace App\Notifications;

use App\Services\AppIdentitySettings;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StoreAccountSetupNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $identity = app(AppIdentitySettings::class);
        $appName = $identity->name();
        $setupUrl = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->from((string) config('mail.from.address'), $appName)
            ->subject("Bienvenue sur le Store {$appName}")
            ->view([
                'mail.store-account-setup',
                'mail.store-account-setup-text',
            ], [
                'appName' => $appName,
                'appLogoUrl' => $identity->logoUrl(),
                'appMainColor' => $identity->mainColor(),
                'setupUrl' => $setupUrl,
                'userName' => $notifiable->name ?? null,
            ]);
    }
}
