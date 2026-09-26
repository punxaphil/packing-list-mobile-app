import { useEffect, useState } from "react";
import { ActionSheetHost } from "~/components/home/ActionSheetHost.tsx";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { applyStoredLanguage } from "~/i18n";
import "~/services/database";
import { AppRoot } from "./AppRoot";
import { RootNavigator } from "./RootNavigatorComponent";
import { ScreenProvider } from "./ScreenProvider";

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
            <RootNavigator />
          </AppRoot>
          <ActionSheetHost />
        </>
      ) : (
        <AppLoadingState />
      )}
    </ScreenProvider>
  );
}
