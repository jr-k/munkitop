<?php

namespace App\Mail;

use App\Services\AppIdentitySettings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class MobileconfigShareLink extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $url,
        public readonly ?string $targetName,
        public readonly ?Carbon $expiresAt,
    ) {
    }

    public function envelope(): Envelope
    {
        $appName = app(AppIdentitySettings::class)->name();

        return new Envelope(
            from: new Address((string) config('mail.from.address'), $appName),
            subject: "{$appName} - Votre profil de configuration Munki",
        );
    }

    public function content(): Content
    {
        $identity = app(AppIdentitySettings::class);

        return new Content(
            view: 'mail.mobileconfig-share-link',
            text: 'mail.mobileconfig-share-link-text',
            with: [
                'appName' => $identity->name(),
                'appLogoUrl' => $identity->logoUrl(),
                'appMainColor' => $identity->mainColor(),
            ],
        );
    }
}
