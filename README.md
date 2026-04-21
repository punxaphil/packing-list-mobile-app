# Packing List Mobile App

A minimal Expo-powered React Native starter written in TypeScript that renders a friendly “Hello, world!” message. Use this repository as a jumping-off point for building a more complete packing list experience.

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (optional but recommended)
- iOS Simulator (Xcode) or Android Emulator (Android Studio) for local device testing, or the Expo Go app on a physical device

### Installation

1. Install dependencies:

   ```shell
   npm install
   ```

2. (Optional) Install Expo CLI globally if you plan to use the `expo` command:

   ```shell
   npm install --global expo-cli
   ```

### Running the App

- Launch the Expo development server:

  ```shell
  npm run start
  ```

- Open the project on an Android emulator/device:

  ```shell
  npm run android
  ```

- Open the project on an iOS simulator/device:

  ```shell
  npm run ios
  ```

- Open the project in a web browser:

  ```shell
  npm run web
  ```

When the development server starts, follow the on-screen instructions to open the project in Expo Go or your preferred simulator.

## Project Structure

```text
src/                   // Application source files
src/App.tsx            // Root component with the hello world view
index.ts               // Registers the root component with Expo
app.json               // Expo project configuration
babel.config.js        // Babel configuration using the Expo preset
package.json           // Project metadata, scripts, and dependencies
tsconfig.json          // TypeScript compiler configuration
```

## Available Scripts

- `npm run start` – Start the Expo development server.
- `npm run android` – Run the project on an Android device or emulator.
- `npm run ios` – Run the project on an iOS simulator or device.
- `npm run web` – Launch the project in a browser (Expo web target).

## Tech Stack

- [React Native](https://reactnative.dev/) 0.81
- [Expo](https://expo.dev/) SDK 54
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5.9

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Snack Playground](https://snack.expo.dev/) for quick prototyping