#!/usr/bin/env bash
set -euo pipefail

TEAM_ID="9B7D9DCSAW"
API_KEY_ID="X9348W3W5L"
API_ISSUER_ID="1047084f-917d-47a4-99a5-16ed1358199b"
API_KEY_PATH="$HOME/.private_keys/AuthKey_${API_KEY_ID}.p8"

echo "==> Detecting connected devices..."
TMPJSON=$(mktemp /tmp/devices.XXXXXX.json)
trap 'rm -f "$TMPJSON"' EXIT
xcrun devicectl list devices --json-output "$TMPJSON" 2>/dev/null

DEVICES=$(python3 -c "
import json, sys
data = json.load(open('$TMPJSON'))
for d in data.get('result', {}).get('devices', []):
    hw = d.get('hardwareProperties', {})
    if hw.get('platform') != 'iOS':
        continue
    name = d.get('deviceProperties', {}).get('name', 'Unknown')
    model = hw.get('marketingName', '')
    udid = d.get('identifier', '')
    os_ver = d.get('deviceProperties', {}).get('osVersionNumber', '')
    print(f'{udid}|{name}|{model}|iOS {os_ver}')
")

if [ -z "$DEVICES" ]; then
  echo "ERROR: No iOS devices found."
  exit 1
fi

DEVICE_LIST=()
while IFS= read -r line; do
  DEVICE_LIST+=("$line")
done <<< "$DEVICES"

if [ ${#DEVICE_LIST[@]} -eq 1 ]; then
  IFS='|' read -r _ name model os <<< "${DEVICE_LIST[0]}"
  echo ""
  echo "Found device: $name ($model, $os)"
  read -rp "Use this device? [Y/n]: " confirm
  if [[ "$confirm" =~ ^[Nn] ]]; then
    echo "Aborted."
    exit 0
  fi
  SELECTED="${DEVICE_LIST[0]}"
else
  echo ""
  echo "Available devices:"
  for i in "${!DEVICE_LIST[@]}"; do
    IFS='|' read -r _ name model os <<< "${DEVICE_LIST[$i]}"
    echo "  $((i + 1))) $name ($model, $os)"
  done
  echo ""
  read -rp "Select device [1-${#DEVICE_LIST[@]}]: " choice
  if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#DEVICE_LIST[@]} ]; then
    echo "ERROR: Invalid selection."
    exit 1
  fi
  SELECTED="${DEVICE_LIST[$((choice - 1))]}"
fi

IFS='|' read -r DEVICE_ID DEVICE_NAME DEVICE_MODEL DEVICE_OS <<< "$SELECTED"
echo "==> Using: $DEVICE_NAME ($DEVICE_MODEL, $DEVICE_OS)"

cd ios
xcodebuild -workspace PackingList.xcworkspace -scheme PackingList \
  -configuration Release -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$API_KEY_PATH" \
  -authenticationKeyID "$API_KEY_ID" \
  -authenticationKeyIssuerID "$API_ISSUER_ID" \
  -derivedDataPath build \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  clean build

APP_PATH="build/Build/Products/Release-iphoneos/PackingList.app"
echo "==> Installing on $DEVICE_NAME..."
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
echo "==> Done!"
