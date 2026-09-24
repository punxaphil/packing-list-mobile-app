import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActionSheetHost } from "~/components/home/ActionSheetHost.tsx";
import { homeColors } from "~/components/home/theme.ts";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { applyStoredLanguage } from "~/i18n";
import "~/services/database";
import { AppRoot } from "./AppRoot";
import { navigationRef } from "./navigation";
import { RootNavigator } from "./RootNavigatorComponent";
import { ScreenProvider } from "./ScreenProvider";

const webTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: homeColors.background } };

async function bootstrap() {
  await applyStoredLanguage();
  const { initSelection } = await import("./selectionState");
  await initSelection();
}

function useBootstrapped() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrap()
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  return ready;
}

export function App() {
  const ready = useBootstrapped();

  return (
    <ScreenProvider>
      {ready ? (
        <>
          <AppRoot>
            <NavigationContainer ref={navigationRef} documentTitle={{ enabled: false }} theme={webTheme}>
              <RootNavigator />
            </NavigationContainer>
          </AppRoot>
          <ActionSheetHost />
        </>
      ) : (
        <AppLoadingState />
      )}
    </ScreenProvider>
  );
}
