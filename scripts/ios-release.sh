#!/bin/bash
cd ios
xcodebuild -workspace PackingList.xcworkspace -scheme PackingList -configuration Release -sdk iphoneos -allowProvisioningUpdates build

APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name 'PackingList.app' -path '*Release-iphoneos*' -type d 2>/dev/null | head -1)
DEVICE_ID=$(xcrun devicectl list devices 2>/dev/null | grep -E "^\s+[A-F0-9-]{36}" | head -1 | awk '{print $1}')
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
