#!/bin/bash
set -e

TEAM_ID="9B7D9DCSAW"
API_KEY_ID="X9348W3W5L"
API_ISSUER_ID="1047084f-917d-47a4-99a5-16ed1358199b"
API_KEY_PATH="$HOME/.private_keys/AuthKey_${API_KEY_ID}.p8"
SCHEME="PackingList"
WORKSPACE="PackingList.xcworkspace"
ARCHIVE_PATH="build/PackingList.xcarchive"
EXPORT_PATH="build/TestFlight"

cd ios

if [ "$1" != "skip-archive" ]; then
  echo "==> Cleaning and archiving..."
  xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" \
    -configuration Release -sdk iphoneos \
    -archivePath "$ARCHIVE_PATH" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    -allowProvisioningUpdates \
    -authenticationKeyPath "$API_KEY_PATH" \
    -authenticationKeyID "$API_KEY_ID" \
    -authenticationKeyIssuerID "$API_ISSUER_ID" \
    clean archive 2>&1
fi

rm -rf "$EXPORT_PATH"

echo "==> Exporting and uploading to TestFlight..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist ../ios/ExportOptions.plist \
  -exportPath "$EXPORT_PATH" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$API_KEY_PATH" \
  -authenticationKeyID "$API_KEY_ID" \
  -authenticationKeyIssuerID "$API_ISSUER_ID" 2>&1

echo "==> Done! Build uploaded to App Store Connect."
