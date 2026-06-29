#!/usr/bin/env bash
set -euo pipefail

PLIST="/Library/LaunchDaemons/com.googlecode.munki.managedsoftwareupdate-check.plist"
LABEL="system/com.googlecode.munki.managedsoftwareupdate-check"
MINUTES="${1:-15}"

usage() {
  echo "Usage: sudo $0 [minutes]" >&2
  echo "Default: 15 minutes" >&2
  echo "Example: sudo $0 1" >&2
}

if [[ ! "$MINUTES" =~ ^[1-9][0-9]*$ ]]; then
  usage
  exit 1
fi

INTERVAL_SECONDS=$((MINUTES * 60))

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

echo "Munki check interval set to ${MINUTES} minute(s) (${INTERVAL_SECONDS}s)."
echo "Backup saved to: $BACKUP"
