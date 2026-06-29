#!/usr/bin/env bash
set -euo pipefail

PLIST="/Library/LaunchDaemons/com.googlecode.munki.managedsoftwareupdate-check.plist"
LABEL="system/com.googlecode.munki.managedsoftwareupdate-check"
INTERVAL_SECONDS=60

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

if [[ ! -f "$PLIST" ]]; then
  echo "Munki launch daemon not found: $PLIST" >&2
  exit 1
fi

BACKUP="${PLIST}.backup.$(date +%Y%m%d%H%M%S)"
cp "$PLIST" "$BACKUP"

if /usr/libexec/PlistBuddy -c "Print :StartInterval" "$PLIST" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Set :StartInterval $INTERVAL_SECONDS" "$PLIST"
else
  /usr/libexec/PlistBuddy -c "Add :StartInterval integer $INTERVAL_SECONDS" "$PLIST"
fi

chown root:wheel "$PLIST"
chmod 644 "$PLIST"

launchctl bootout system "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap system "$PLIST"
launchctl kickstart -k "$LABEL" >/dev/null 2>&1 || true

echo "Munki check interval set to ${INTERVAL_SECONDS}s."
echo "Backup saved to: $BACKUP"
