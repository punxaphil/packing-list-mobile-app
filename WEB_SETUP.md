# Web Support Setup

This document describes the changes made to support web builds alongside iOS and Android.

## Changes Made

### 1. **Dependencies Added** (`package.json`)
- `react-native-web`: ^0.19.14 - Cross-platform React Native components for web
- `react-dom`: 19.1.0 - React DOM for web rendering
- `vite`: ^5.4.0 - Fast bundler for web development
- `@vitejs/plugin-react`: ^4.3.0 - Vite React plugin for JSX support

### 2. **Web Entry Point** (`index.web.tsx`)
- Separate entry point for web builds
- Initializes React DOM root and renders `WebShell` component
- Metro bundler will automatically use this for web, `index.js` for native

### 3. **Web Shell** (`src/web/WebShell.tsx`)
- Replaces React Native Navigation with a simple React component
- Bootstraps the app with language settings and providers
- Currently uses the existing `AppRoot` component
- **Note**: Full navigation migration to React Navigation is the next phase

### 4. **Platform-Specific Service Adapters**
Created `.native.ts` and `.web.ts` versions for four critical services:

#### **Subscriptions** (`subscription.native.ts` / `subscription.web.ts`)
- **Native**: Uses RevenueCat SDK (iOS/Android)
- **Web**: Disabled (throws errors if attempted)

#### **Apple Sign-In** (`appleAuth.native.ts` / `appleAuth.web.ts`)
- **Native**: Uses `@invertase/react-native-apple-authentication` for native auth
- **Web**: Uses Firebase `OAuthProvider` with popup for browser-based auth

#### **Image Utilities** (`imageUtils.native.ts` / `imageUtils.web.ts`)
- **Native**: Uses `react-native-image-crop-picker` for native file selection
- **Web**: Uses browser `<input type="file">` with canvas-based image cropping

#### **Packing List Reminders** (`packingListReminder.native.ts` / `packingListReminder.web.ts`)
- **Native**: Uses iOS-specific reminder module
- **Web**: Disabled (feature not available)

### 5. **Bundler Configuration**

#### **Vite Configuration** (`vite.config.ts`)
- Configured for web development server on port 3000
- Aliases `react-native` to `react-native-web`
- Resolves `~` alias to `src/`
- Prioritizes `.web.ts` files in resolution order
- Outputs to `dist/` directory

#### **Metro Configuration Update** (`metro.config.js`)
- Added support for `.native.ts` and `.web.ts` extensions
- Metro now resolves platform-specific files correctly

### 6. **HTML & CSS**
- `public/index.html`: Standard HTML entry point for web
- `src/web/webGlobals.css`: Global styles for web layout
- `src/web/webShell.css`: Component-specific styles for web shell

### 7. **TypeScript Configuration**
- Updated `tsconfig.json` to include `index.web.tsx`
- Excluded Vite config from compilation

## Running the Web Build

### Development
```bash
npm run web
```
Starts Vite dev server at http://localhost:3000

### Production Build
```bash
npm run web:build
```
Creates optimized build in `dist/` directory

### Preview Production Build
```bash
npm run web:preview
```
Serves the built version locally

## Current Limitations & Known Issues

### 1. **Navigation Shell**
- Currently using `AppRoot` from React Native Navigation
- This will cause errors on web because React Native Navigation doesn't have a web target
- **Next step**: Migrate to React Navigation for full cross-platform support

### 2. **Subscriptions**
- Disabled on web (feature not available)
- Update UI to check platform and hide subscription features on web

### 3. **Reminders**
- Disabled on web
- Future: Implement browser notifications or calendar export

### 4. **Sheet/Modal Styling**
- React Native sheet behaviors don't perfectly map to web
- May need custom CSS media queries for responsive design

### 5. **Icon Font**
- `react-native-vector-icons` works via react-native-web
- Ensure font files are properly bundled by Vite

## Import Pattern

Services use platform-specific imports:

```typescript
// Shared code imports the base module name
import { signInWithApple } from "~/services/appleAuth";

// Bundlers automatically resolve:
// - Web: appleAuth.web.ts
// - Native: appleAuth.native.ts
```

**Do not include `.web` or `.native` extensions in imports.**

## Next Steps

1. **Fix Navigation Shell** (high priority)
   - Migrate from React Native Navigation to React Navigation
   - This is required for web to work at all
   - See [navigation migration guide](./NAVIGATION_MIGRATION.md) (to be created)

2. **Update UI for Platform Differences**
   - Hide subscription UI on web
   - Hide reminder features on web
   - Add platform checks: `if (Platform.OS !== "web")`

3. **Test Web Build**
   - Start dev server: `npm run web`
   - Log in with email/password or Apple
   - Test core packing list functionality
   - Verify Firebase Firestore sync works

4. **Optimize Web Layout**
   - Adjust responsive design for desktop/tablet
   - Improve touch/mouse interactions
   - Add web-specific CSS media queries

5. **Build & Deploy**
   - Build: `npm run web:build`
   - Deploy to Firebase Hosting, Vercel, or other platform
   - Set up CI/CD for automated web deployments

## Platform Detection in Code

```typescript
import { Platform } from "react-native";

if (Platform.OS === "web") {
  // Web-specific code
} else if (Platform.OS === "ios") {
  // iOS-specific code
} else if (Platform.OS === "android") {
  // Android-specific code
}
```

## Troubleshooting

### Build fails with "module not found"
- Ensure the correct `.web.ts` or `.native.ts` file exists
- Check imports don't include file extension
- Restart dev server after adding new files

### React Native Navigation errors on web
- This is expected—full web support requires navigation migration
- See "Fix Navigation Shell" in Next Steps

### Styles look wrong on web
- Check `webGlobals.css` and `webShell.css`
- Ensure media queries are appropriate
- React Native styles may need web-specific adjustments

### Environment variables not working
- Create `.env.local` for local development
- Vite reads from `import.meta.env.*`
- See Vite env docs: https://vitejs.dev/guide/env-and-modes
