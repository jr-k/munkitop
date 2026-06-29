<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\MobileconfigShare;
use App\Models\Person;
use App\Services\MunkiExternalUrl;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class MunkiProfileController extends Controller
{
    public function __construct(private readonly MunkiExternalUrl $externalUrl)
    {
    }

    public function group(Group $group): Response
    {
        return $this->download($this->groupPayload($group));
    }

    public function person(Person $person): Response
    {
        return $this->download($this->personPayload($person));
    }

    public function groupPreview(Group $group): JsonResponse
    {
        return $this->preview($this->groupPayload($group));
    }

    public function personPreview(Person $person): JsonResponse
    {
        return $this->preview($this->personPayload($person));
    }

    public function shareGroup(Request $request, Group $group): JsonResponse
    {
        return $this->share($request, Group::class, $group->getKey());
    }

    public function sharePerson(Request $request, Person $person): JsonResponse
    {
        return $this->share($request, Person::class, $person->getKey());
    }

    public function shared(MobileconfigShare $share): View
    {
        $payload = $this->sharedPayload($share);

        return view('mobileconfig-share', [
            'clientDownloadUrl' => $this->munkiClientDownloadUrl(),
            'downloadUrl' => route('mobileconfig.shared.download', $share),
            'fileName' => $payload['fileName'],
            'profileName' => $payload['profileName'],
        ]);
    }

    public function downloadShared(MobileconfigShare $share): Response
    {
        return $this->download($this->sharedPayload($share));
    }

    private function sharedPayload(MobileconfigShare $share): array
    {
        if ($share->expires_at && $share->expires_at->isPast()) {
            abort(404);
        }

        $target = $share->target;

        if ($target instanceof Group) {
            return $this->groupPayload($target);
        }

        if ($target instanceof Person) {
            return $this->personPayload($target);
        }

        abort(404);
    }

    private function munkiClientDownloadUrl(): string
    {
        return Cache::remember('munki_client_pkg_url', now()->addHour(), function () {
            $fallbackUrl = 'https://github.com/macadmins/munki-builds/releases';

            try {
                $release = Http::acceptJson()
                    ->timeout(4)
                    ->get('https://api.github.com/repos/macadmins/munki-builds/releases/latest');

                if (! $release->ok()) {
                    return $fallbackUrl;
                }

                $asset = collect($release->json('assets', []))
                    ->first(fn (array $asset) => str_ends_with(strtolower($asset['name'] ?? ''), '.pkg'));

                return $asset['browser_download_url'] ?? $fallbackUrl;
            } catch (\Throwable) {
                return $fallbackUrl;
            }
        });
    }

    private function preview(array $payload): JsonResponse
    {
        return response()->json([
            'content' => $this->mobileconfig($payload),
            'file_name' => $payload['fileName'],
        ]);
    }

    private function share(Request $request, string $targetClass, int $targetId): JsonResponse
    {
        $data = $request->validate([
            'expires_in' => ['nullable', Rule::in(['never', '1d', '7d', '30d'])],
        ]);

        $expiresAt = match ($data['expires_in'] ?? 'never') {
            '1d' => now()->addDay(),
            '7d' => now()->addDays(7),
            '30d' => now()->addDays(30),
            default => null,
        };

        $share = MobileconfigShare::create([
            'ulid' => strtolower((string) Str::ulid()),
            'target_type' => $targetClass,
            'target_id' => $targetId,
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'url' => url('/m/'.$share->ulid),
            'expires_at' => $share->expires_at?->toIso8601String(),
        ], 201);
    }

    private function download(array $payload): Response
    {
        $mobileconfig = $this->mobileconfig($payload);

        return response($mobileconfig, 200, [
            'Content-Disposition' => 'attachment; filename="'.$payload['fileName'].'"',
            'Content-Type' => 'application/x-apple-aspen-config',
        ]);
    }

    private function groupPayload(Group $group): array
    {
        return $this->payload(
            profileName: $group->name,
            identifierSuffix: $group->slug,
            clientIdentifier: $group->slug,
            fileName: "munki-{$group->slug}.mobileconfig",
            targetLabel: 'group',
        );
    }

    private function personPayload(Person $person): array
    {
        $displayName = trim("{$person->first_name} {$person->name}") ?: $person->client_identifier;
        $safeName = Str::of($person->client_identifier)
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->trim('-')
            ->value();

        return $this->payload(
            profileName: $displayName,
            identifierSuffix: $safeName,
            clientIdentifier: $person->client_identifier,
            fileName: "munki-{$safeName}.mobileconfig",
            targetLabel: 'person',
        );
    }

    private function payload(
        string $profileName,
        string $identifierSuffix,
        string $clientIdentifier,
        string $fileName,
        string $targetLabel,
    ): array {
        return [
            'profileName' => $profileName,
            'identifier' => "com.munkitop.munki.{$identifierSuffix}",
            'payloadUuid' => (string) Str::uuid(),
            'contentUuid' => (string) Str::uuid(),
            'repoUrl' => $this->externalUrl->repoUrl(),
            'clientIdentifier' => $clientIdentifier,
            'fileName' => $fileName,
            'targetLabel' => $targetLabel,
        ];
    }

    private function mobileconfig(array $values): string
    {
        $profileName = $this->xml($values['profileName']);
        $identifier = $this->xml($values['identifier']);
        $payloadUuid = $this->xml($values['payloadUuid']);
        $contentUuid = $this->xml($values['contentUuid']);
        $repoUrl = $this->xml($values['repoUrl']);
        $clientIdentifier = $this->xml($values['clientIdentifier']);
        $targetLabel = $this->xml($values['targetLabel']);

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>ClientIdentifier</key>
            <string>{$clientIdentifier}</string>
            <key>LogToSyslog</key>
            <true/>
            <key>PayloadDescription</key>
            <string>Configure Munki for the {$profileName} {$targetLabel}.</string>
            <key>PayloadDisplayName</key>
            <string>{$profileName}</string>
            <key>PayloadIdentifier</key>
            <string>{$identifier}.managedinstalls</string>
            <key>PayloadType</key>
            <string>ManagedInstalls</string>
            <key>PayloadUUID</key>
            <string>{$contentUuid}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>SoftwareRepoURL</key>
            <string>{$repoUrl}</string>
            <key>SuppressAutoInstall</key>
            <false/>
            <key>SuppressLoginwindowInstall</key>
            <false/>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Munki configuration profile generated by Munkitop.</string>
    <key>PayloadDisplayName</key>
    <string>{$profileName}</string>
    <key>PayloadIdentifier</key>
    <string>{$identifier}</string>
    <key>PayloadOrganization</key>
    <string>Munkitop</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadScope</key>
    <string>System</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>{$payloadUuid}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
XML;
    }

    private function xml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
