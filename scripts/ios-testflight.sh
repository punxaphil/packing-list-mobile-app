#!/usr/bin/env bash
set -euo pipefail

TEAM_ID="9B7D9DCSAW"
API_KEY_ID="X9348W3W5L"
API_ISSUER_ID="1047084f-917d-47a4-99a5-16ed1358199b"
API_KEY_PATH="$HOME/.private_keys/AuthKey_${API_KEY_ID}.p8"
SCHEME="PackingList"
WORKSPACE="PackingList.xcworkspace"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_BINARY=$(source "$SCRIPT_DIR/../ios/.xcode.env.local" && echo "$NODE_BINARY")
BUILD_DIR="$SCRIPT_DIR/../ios/build/testflight"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
ARCHIVE_PATH="$BUILD_DIR/PackingList.xcarchive"
EXPORT_PATH="$BUILD_DIR/Export"
EXPORT_PLIST="$BUILD_DIR/ExportOptions-local.plist"

timestamp() { date '+%H:%M:%S'; }

cleanup() {
  echo ""
  echo "$(timestamp) ==> Cleaning up child processes..."
  kill -- -$$ 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd ios

if ! DevToolsSecurity -status 2>&1 | grep -q "enabled"; then
  echo "ERROR: Developer mode is disabled. Run: sudo DevToolsSecurity -enable"
  exit 1
fi

echo "$(timestamp) ==> Build dir: $BUILD_DIR"

echo "$(timestamp) ==> Killing stale build processes..."
pkill -f 'ios/build/testflight' 2>/dev/null || true

echo "$(timestamp) ==> Stripping quarantine attributes..."
xattr -rd com.apple.provenance "$SCRIPT_DIR/../node_modules" "$SCRIPT_DIR/../ios/Pods" 2>/dev/null || true

if [ "${1:-}" != "skip-archive" ]; then
  echo "$(timestamp) ==> Generating codegen artifacts..."
  "$NODE_BINARY" "$SCRIPT_DIR/../node_modules/react-native/scripts/generate-codegen-artifacts.js" \
    --path "$SCRIPT_DIR/.." \
    --outputPath "$SCRIPT_DIR/../ios" \
    --targetPlatform ios

  echo "$(timestamp) ==> Archiving (this takes a few minutes)..."
  xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" \
    -configuration Release -sdk iphoneos \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    -allowProvisioningUpdates \
    -authenticationKeyPath "$API_KEY_PATH" \
    -authenticationKeyID "$API_KEY_ID" \
    -authenticationKeyIssuerID "$API_ISSUER_ID" \
    archive
  echo "$(timestamp) ==> Archive complete."
fi

echo "$(timestamp) ==> Bumping build number..."
INFO_PLIST="PackingList/Info.plist"
BUILD_NUM=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$INFO_PLIST")
NEW_BUILD_NUM=$((BUILD_NUM + 1))
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD_NUM" "$INFO_PLIST"
echo "             Build number: $BUILD_NUM -> $NEW_BUILD_NUM"

cat > "$EXPORT_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>${TEAM_ID}</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadBitcode</key><false/>
  <key>uploadSymbols</key><true/>
  <key>destination</key><string>export</string>
</dict>
</plist>
EOF

echo "$(timestamp) ==> Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_PLIST" \
  -exportPath "$EXPORT_PATH" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$API_KEY_PATH" \
  -authenticationKeyID "$API_KEY_ID" \
  -authenticationKeyIssuerID "$API_ISSUER_ID"
echo "$(timestamp) ==> Export complete."

IPA_FILE=$(find "$EXPORT_PATH" -name '*.ipa' -print -quit)
if [ -z "$IPA_FILE" ]; then
  echo "ERROR: No .ipa file found in $EXPORT_PATH"
  exit 1
fi

echo "$(timestamp) ==> Uploading $IPA_FILE to App Store Connect..."
xcrun altool --upload-app \
  -f "$IPA_FILE" \
  -t ios \
  --apiKey "$API_KEY_ID" \
  --apiIssuer "$API_ISSUER_ID"

echo "$(timestamp) ==> Done! Build $NEW_BUILD_NUM uploaded to App Store Connect."
