<?php

namespace App\Services;

use App\Models\AppSetting;

class MunkiExternalUrl
{
    private const OVERRIDE_KEY = 'munki_external_url_override';
    private const URL_KEY = 'munki_external_url';

    public function baseUrl(): string
    {
        $settings = $this->settings();

        if ($settings['override'] && $settings['url'] !== '') {
            return $this->normalize($settings['url']);
        }

        return $this->defaultBaseUrl();
    }

    public function repoUrl(): string
    {
        return $this->baseUrl().'/repo';
    }

    public function settings(): array
    {
        $override = AppSetting::query()
            ->where('key', self::OVERRIDE_KEY)
            ->value('value') === '1';
        $url = (string) AppSetting::query()
            ->where('key', self::URL_KEY)
            ->value('value');

        return [
            'override' => $override,
            'url' => $url !== '' ? $this->normalize($url) : $this->defaultBaseUrl(),
            'defaultUrl' => $this->defaultBaseUrl(),
        ];
    }

    public function update(bool $override, ?string $url): void
    {
        AppSetting::query()->updateOrCreate(
            ['key' => self::OVERRIDE_KEY],
            ['value' => $override ? '1' : '0'],
        );

        AppSetting::query()->updateOrCreate(
            ['key' => self::URL_KEY],
            ['value' => $url ? $this->normalize($url) : null],
        );
    }

    private function defaultBaseUrl(): string
    {
        return $this->normalize((string) config('app.url'));
    }

    private function normalize(string $url): string
    {
        return rtrim($url, '/');
    }
}
