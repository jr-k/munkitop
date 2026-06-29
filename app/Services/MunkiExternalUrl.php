<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Http\Request;

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
        if (! app()->runningInConsole() && app()->bound('request')) {
            return $this->normalize($this->requestBaseUrl(request()));
        }

        return $this->normalize((string) config('app.url'));
    }

    private function requestBaseUrl(Request $request): string
    {
        $forwardedHost = $this->firstHeaderValue($request, 'X-Forwarded-Host');
        $forwardedProto = $this->firstHeaderValue($request, 'X-Forwarded-Proto');

        if ($forwardedHost === '' && $forwardedProto === '') {
            return $request->root();
        }

        $scheme = $forwardedProto !== '' ? $forwardedProto : $request->getScheme();
        $host = $forwardedHost !== '' ? $forwardedHost : $request->getHost();
        $port = $this->firstHeaderValue($request, 'X-Forwarded-Port');

        if ($port !== '' && ! str_contains($host, ':') && ! $this->isDefaultPort($scheme, $port)) {
            $host .= ':'.$port;
        }

        return $scheme.'://'.$host;
    }

    private function firstHeaderValue(Request $request, string $header): string
    {
        return trim(explode(',', (string) $request->headers->get($header))[0] ?? '');
    }

    private function isDefaultPort(string $scheme, string $port): bool
    {
        return ($scheme === 'https' && $port === '443') || ($scheme === 'http' && $port === '80');
    }

    private function normalize(string $url): string
    {
        $url = rtrim($url, '/');
        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host = parse_url($url, PHP_URL_HOST);
        $port = parse_url($url, PHP_URL_PORT);

        if (! is_string($scheme) || ! is_string($host) || $port === null || ! $this->isDefaultPort($scheme, (string) $port)) {
            return $url;
        }

        $user = parse_url($url, PHP_URL_USER);
        $pass = parse_url($url, PHP_URL_PASS);
        $path = parse_url($url, PHP_URL_PATH);
        $query = parse_url($url, PHP_URL_QUERY);
        $fragment = parse_url($url, PHP_URL_FRAGMENT);
        $auth = is_string($user) ? $user.(is_string($pass) ? ':'.$pass : '').'@' : '';

        return $scheme.'://'.$auth.$host
            .(is_string($path) ? $path : '')
            .(is_string($query) ? '?'.$query : '')
            .(is_string($fragment) ? '#'.$fragment : '');
    }
}
