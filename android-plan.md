# Android Support Plan

## Current State

The `android/` folder exists but is **not usable**. It was scaffolded from an Expo template and has never been configured for this bare React Native + react-native-navigation project. It will not build.

Key evidence:
- `MainActivity.kt` / `MainApplication.kt` imported `expo.modules.*` (Expo is not a dependency)
- Android package declarations already use `se.kodsam.packsmarter`, which matches Firebase and iOS bundle identifiers
- `getMainComponentName()` returns `"main"` (Expo) instead of what react-native-navigation requires
- `MainApplication.kt` wraps with `ReactNativeHostWrapper` (Expo-only)
- `build.gradle` references `expo/scripts/resolveAppEntry` for `entryFile`
- `AndroidManifest.xml` has Expo update metadata
- Firebase required Android-side Gradle wiring and `google-services.json`
- `react-native-navigation` not wired into the Android host at all

---

## Work Items

### 1. Rebuild Android native host (Blocker)

React-native-navigation requires `MainActivity` to extend `NavigationActivity` and `MainApplication` to extend `NavigationApplication` (or use its delegate pattern). The current Expo-based files must be replaced entirely.

- Rewrite `MainActivity.kt` to extend `com.reactnativenavigation.NavigationActivity`
- Rewrite `MainApplication.kt` to extend `NavigationApplication` with RNN's `NavigationReactNativeHost`
- Keep package name aligned on `se.kodsam.packsmarter`
- Fix `build.gradle` `entryFile` to point to the actual `index.js` (not the Expo virtual entry)
- Remove all Expo references from build files and manifests
- Update `AndroidManifest.xml`: remove Expo metadata, fix app label/icon refs

### 2. Firebase (Blocker)

Firebase is used for auth and Firestore. Android requires a separate config file.

- Download `google-services.json` from Firebase console (project `packing-list-448814`) and place in `android/app/`
- Add `com.google.gms:google-services` classpath to `android/build.gradle`
- Apply `google-services` plugin in `android/app/build.gradle`

### 3. React-native-vector-icons

Vector icons require font files to be copied into the APK on Android.

- Add to `android/app/build.gradle`:
  ```gradle
  apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
  ```

### 4. Bottom tab icons — Navigation

`navigation.ts` only sets `sfSymbol` for tab icons (iOS-only). Android needs explicit icon resources.

- Add PNG icons (or use vector drawables) for the 4 tabs: Items, Lists, Categories, Members
- Place in `android/app/src/main/res/drawable/`
- In `navigation.ts`, add `icon: require(...)` or the drawable name for `Platform.OS === 'android'` alongside the existing `sfSymbol` blocks

Alternatively: use `react-native-vector-icons` to generate icon images programmatically and pass them as `Navigation.resolveAssetSource(...)`.

### 5. showActionSheet — iOS-only API (Medium)

`src/components/home/showActionSheet.ts` uses `ActionSheetIOS` directly, which crashes on Android.

- Replace implementation with a cross-platform approach
- Options:
  - **Preferred**: Use `@expo/react-native-action-sheet` or `react-native-action-sheet` package (cross-platform)
  - **Alternative**: Render a custom JS bottom-sheet modal component for Android, keep `ActionSheetIOS` for iOS (via `Platform.select`)
- `showActionSheet` is called in many places — the fix is isolated to this one file

### 6. showNativeTextPrompt — iOS-only (Medium)

`src/components/home/showNativeTextPrompt.ts` returns `false` on Android (it uses `Alert.prompt` which is iOS-only). Callers must handle the `false` return and fall back to a JS-based text input modal.

Audit: find all call sites of `showNativeTextPrompt` and confirm they already have a JS fallback when `false` is returned. If not, implement a cross-platform `TextInputModal` component as fallback.

### 7. Permissions in AndroidManifest

Current `AndroidManifest.xml` has some leftover Expo permissions and is missing some needed ones.

- Remove `RECORD_AUDIO` (not used)
- Remove `SYSTEM_ALERT_WINDOW` (not needed)
- Remove Expo update metadata
- Add `READ_MEDIA_IMAGES` (Android 13+) / `READ_EXTERNAL_STORAGE` for image picker
- Verify `CAMERA` permission for `react-native-image-crop-picker`

---

## Later

### 8. Notifications / Reminders — native module missing

`PackingListReminderModule.swift` is an iOS-only native module for scheduling local notifications via `UNUserNotificationCenter`. There is no Android counterpart.

- Implement an Android `ReactContextBaseJavaModule` in Kotlin that:
  - Shows a date/time picker (`TimePickerDialog` / `DatePickerDialog`)
  - Schedules notifications via `AlarmManager` or `WorkManager`
- Or: replace the native module on both platforms with `notifee` or `@react-native-community/push-notification-ios` / `react-native-push-notification` (cross-platform library)

**This can be deferred to after initial Android launch.**

### 9. Apple Sign In — Android alternative

We are intentionally skipping this in the first Android iteration.

`src/components/auth/Auth.tsx` shows a "Sign in with Apple" button. Email/password auth already works cross-platform and is enough for the first pass.

Later options:
- Add Google Sign In (`@react-native-google-signin/google-signin`) as the Android-primary auth option and keep Apple Sign In on iOS
- Or enable the Apple Sign In web flow on Android

### 10. RenameItemSheet — native module missing (Low, can defer)

`RenameItemSheetModule.swift` presents a native iOS sheet with `UISheetPresentationController`. It provides a native "rename" UX. There is no Android counterpart.

- The JS layer likely falls back to the `showNativeTextPrompt` / JS modal path already. Verify this.
- If Android needs a native sheet feel, implement using `BottomSheetDialog` in Kotlin.

**This can be deferred — the JS fallback is likely sufficient.**

### 11. PageSheet modal (Low)

`src/components/shared/PageSheet.tsx` uses `Modal` with `presentationStyle="pageSheet"`. This has no visual effect on Android (it renders full-screen).

- For Android: consider using a `react-native-bottom-sheet` library, or accept full-screen modals as-is.
- Purely visual — does not block functionality.

---

## Suggested Implementation Order

| Priority | Item | Effort |
|---|---|---|
| 1 | Rebuild Android native host (RNN + fix Expo mess) | High |
| 2 | Firebase `google-services.json` + plugin | Low |
| 3 | Vector icons fonts Gradle task | Low |
| 4 | Bottom tab icons for Android | Low |
| 5 | `showActionSheet` cross-platform fix | Medium |
| 6 | `showNativeTextPrompt` fallback audit | Low |
| 7 | Fix AndroidManifest permissions | Low |
| 8 | Notifications native module (Android) | High – defer |
| 9 | Auth: Android sign-in alternative | Medium – defer |
| 10 | RenameItemSheet Android (if needed) | Medium – defer |
| 11 | PageSheet visual polish on Android | Low – defer |

Items 1–7 are needed for a working first Android build. Items 8–11 can ship later.
