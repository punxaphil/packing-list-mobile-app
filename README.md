# Packsy

Packsy is a React Native packing-list app with Firebase Auth + Firestore and a TypeScript Firebase Cloud Function for account deletion.

## Prerequisites

- Node.js 20 (`nvm use` reads `.nvmrc`)
- npm
- Xcode (iOS) and/or Android Studio (Android)
- Firebase CLI (`npm i -g firebase-tools`) for function deploys

## Setup

1. Install app dependencies:

  ```sh
  npm install
  ```

2. Install function dependencies:

  ```sh
  npm --prefix functions install
  ```

## Run The App

1. Start Metro:

  ```sh
  npm run start
  ```

2. Run iOS simulator:

  ```sh
  npm run ios:simulator
  ```

3. Run Android:

  ```sh
  npm run android
  ```

## Quality Checks

Run full checks before committing:

```sh
npm run prebuild
```

## Deploy Cloud Function

The account deletion function is in `functions/src/index.ts` and deploys as `deleteMyAccount`.

1. Build functions locally:

  ```sh
  npm --prefix functions run build
  ```

2. Deploy function:

  ```sh
  firebase deploy --only functions:deleteMyAccount
  ```

Notes:

- `firebase.json` is configured with a functions predeploy build step.
- Default Firebase project is set in `.firebaserc`.

## Useful Commands

- `npm run prebuild` - typecheck + lint + knip + unit tests
- `npm run lint:fix` - auto-fix lint/format issues
- `npm run ios:simulator` - run iOS simulator
- `npm run test:unit` - run unit tests