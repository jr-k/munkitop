<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Storage;

class PublicStoreSettings
{
    public const DEFAULT_NAME = 'Public Store';

    public const DEFAULT_MAIN_COLOR = '#2563eb';

    public const PRESET_COLORS = [
        '#2563eb',
        '#7c3aed',
        '#db2777',
        '#dc2626',
        '#ea580c',
        '#16a34a',
        '#0891b2',
        '#111827',
    ];

    private const NAME_KEY = 'public_store_name';

    private const MAIN_COLOR_KEY = 'public_store_main_color';

    private const LOGO_PATH_KEY = 'public_store_logo_path';

    public function payload(): array
    {
        return [
            'name' => $this->name(),
            'main_color' => $this->mainColor(),
            'logo_url' => $this->logoUrl(),
            'preset_colors' => self::PRESET_COLORS,
        ];
    }

    public function name(): string
    {
        $name = trim((string) $this->value(self::NAME_KEY));

        return $name !== '' ? $name : self::DEFAULT_NAME;
    }

    public function mainColor(): string
    {
        $color = strtolower(trim((string) $this->value(self::MAIN_COLOR_KEY)));

        return preg_match('/^#[0-9a-f]{6}$/', $color) === 1 ? $color : self::DEFAULT_MAIN_COLOR;
    }

    public function logoPath(): ?string
    {
        $path = trim((string) $this->value(self::LOGO_PATH_KEY));

        return $path !== '' ? $path : null;
    }

    public function logoUrl(): ?string
    {
        $path = $this->logoPath();

        if (! $path) {
            return null;
        }

        return route('store.logo', ['v' => $this->logoVersion($path)]);
    }

    public function update(string $name, string $mainColor, ?string $logoPath = null): void
    {
        $this->set(self::NAME_KEY, trim($name) !== '' ? trim($name) : self::DEFAULT_NAME);
        $this->set(self::MAIN_COLOR_KEY, strtolower($mainColor));

        if ($logoPath !== null) {
            $this->set(self::LOGO_PATH_KEY, $logoPath);
        }
    }

    private function value(string $key): ?string
    {
        return AppSetting::query()
            ->where('key', $key)
            ->value('value');
    }

    private function set(string $key, ?string $value): void
    {
        AppSetting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );
    }

    private function logoVersion(string $path): string
    {
        $absolutePath = Storage::disk('local')->path($path);

        if (! is_file($absolutePath)) {
            return sha1($path);
        }

        return sha1(implode('|', [
            $path,
            filemtime($absolutePath) ?: 0,
            filesize($absolutePath) ?: 0,
        ]));
    }
}
