#!/bin/bash
source .env

cd ios
xcodebuild -workspace PackingList.xcworkspace -scheme PackingList -configuration Release -sdk iphoneos -allowProvisioningUpdates -derivedDataPath build clean build

APP_PATH="build/Build/Products/Release-iphoneos/PackingList.app"
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
