import { useEffect, useRef } from "react";
import { Login, useCurrentUser } from "~/components/auth/Auth";
import { AppLoadingState, useDelayedLoading } from "~/components/shared/AppLoadingState.tsx";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { setAppState } from "./appState";
import { showMainTabs } from "./navigation";
import { getSelectedId } from "./selectionState";

function BootstrapAndLaunch({ userId, email }: { userId: string; email: string }) {
  const ready = useSpaceBootstrap(userId, email);
  const prevHasSelection = useRef<boolean | null>(null);
  const showLoader = useDelayedLoading(!ready);

  useEffect(() => {
    if (!ready) return;
    setAppState({ userId, email });
    const hasSelection = getSelectedId() !== "";
    if (prevHasSelection.current !== hasSelection) {
      prevHasSelection.current = hasSelection;
      showMainTabs(hasSelection);
    }
  }, [ready, userId, email]);

  return showLoader ? <AppLoadingState /> : null;
}

export function AppRoot() {
  const { userId, email, loggingIn } = useCurrentUser();
  const showLoader = useDelayedLoading(loggingIn);

  if (showLoader) {
    return <AppLoadingState />;
  }

  if (!userId) return <Login />;

  return <BootstrapAndLaunch userId={userId} email={email} />;
}
