import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { AndroidActionSheetHost } from "~/components/home/AndroidActionSheetHost.tsx";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { applyStoredLanguage } from "~/i18n";
import "~/services/database";
import { AppRoot } from "./AppRoot";
import { navigationRef } from "./navigation";
import { RootNavigator } from "./RootNavigatorComponent";
import { ScreenProvider } from "./ScreenProvider";

async function bootstrap() {
  await applyStoredLanguage();
  const { initSelection } = await import("./selectionState");
  await initSelection();
  const { registerPackingListReminderHandler } = await import("~/services/packingListReminder");
  registerPackingListReminderHandler();
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
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </AppRoot>
          <AndroidActionSheetHost />
        </>
      ) : (
        <AppLoadingState />
      )}
    </ScreenProvider>
  );
}
