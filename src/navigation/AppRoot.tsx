import { useEffect, useRef } from "react";
import { Login } from "~/components/auth/Auth";
import { VerifyEmail } from "~/components/auth/VerifyEmail";
import { AppLoadingState, useDelayedLoading } from "~/components/shared/AppLoadingState.tsx";
import { useCurrentUser } from "~/hooks/useCurrentUser.ts";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { setAppState } from "./appState";
import { ITEMS_TAB, LISTS_TAB, showMainTabs } from "./navigation";
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
      showMainTabs(hasSelection ? ITEMS_TAB : LISTS_TAB);
    }
  }, [ready, userId, email]);

  return showLoader ? <AppLoadingState /> : null;
}

export function AppRoot() {
  const { userId, email, verificationRequired, loggingIn, recheckUser } = useCurrentUser();

  if (loggingIn) return <AppLoadingState />;
  if (!userId) return <Login />;
  if (verificationRequired) return <VerifyEmail recheckUser={recheckUser} />;

  return <BootstrapAndLaunch userId={userId} email={email} />;
}
