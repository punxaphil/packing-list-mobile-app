#!/bin/bash
set -e
source .env

TEAM_ID="9B7D9DCSAW"

cd ios
xcodebuild -workspace PackingList.xcworkspace -scheme PackingList -configuration Release -sdk iphoneos -allowProvisioningUpdates -derivedDataPath build DEVELOPMENT_TEAM="$TEAM_ID" clean build 2>&1

APP_PATH="build/Build/Products/Release-iphoneos/PackingList.app"
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
