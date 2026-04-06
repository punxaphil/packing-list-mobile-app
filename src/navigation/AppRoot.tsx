import { useEffect, useRef } from "react";
import { Login, useCurrentUser } from "~/components/auth/Auth";
import { HOME_COPY } from "~/components/home/styles";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { setAppState } from "./appState";
import { showMainTabs } from "./navigation";
import { getSelectedId } from "./selectionState";

function BootstrapAndLaunch({ userId, email }: { userId: string; email: string }) {
  const ready = useSpaceBootstrap(userId, email);
  const prevHasSelection = useRef<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;
    setAppState({ userId, email });
    const hasSelection = getSelectedId() !== "";
    if (prevHasSelection.current !== hasSelection) {
      prevHasSelection.current = hasSelection;
      showMainTabs(hasSelection);
    }
  }, [ready, userId, email]);

  return <AppLoadingState label={HOME_COPY.loading} />;
}

export function AppRoot() {
  const { userId, email, loggingIn } = useCurrentUser();

  if (loggingIn) {
    return <AppLoadingState label={HOME_COPY.loading} />;
  }

  if (!userId) return <Login />;

  return <BootstrapAndLaunch userId={userId} email={email} />;
}
