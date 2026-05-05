import { useCallback, useEffect, useRef } from "react";
import { Login } from "~/components/auth/Auth";
import { VerifyEmail } from "~/components/auth/VerifyEmail";
import { SubscriptionGate } from "~/components/subscription/SubscriptionGate.tsx";
import { hasActiveAppAccessTrial } from "~/components/subscription/subscriptionAccess.ts";
import { useCurrentUser } from "~/hooks/useCurrentUser.ts";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { SubscriptionProvider } from "~/providers/SubscriptionProvider.tsx";
import { setAppState } from "./appState";
import { ITEMS_TAB, LISTS_TAB, showMainTabs } from "./navigation";
import { getSelectedId } from "./selectionState";
import { signOutUser } from "./signOut.ts";
import { useLoadingOverlay } from "./useLoadingOverlay.ts";

function BootstrapAndLaunch({ userId, email }: { userId: string; email: string }) {
  const ready = useSpaceBootstrap(userId, email);
  const { isSubscribed, loading } = useSubscription();
  const prevHasSelection = useRef<boolean | null>(null);
  useLoadingOverlay(!ready || loading);
  const hasAccess = hasActiveAppAccessTrial() || isSubscribed;
  const signOut = useCallback(() => {
    signOutUser().catch(console.error);
  }, []);

  useEffect(() => {
    if (!ready || loading || !hasAccess) return;
    setAppState({ userId, email });
    const hasSelection = getSelectedId() !== "";
    if (prevHasSelection.current !== hasSelection) {
      prevHasSelection.current = hasSelection;
      showMainTabs(hasSelection ? ITEMS_TAB : LISTS_TAB);
    }
  }, [ready, loading, hasAccess, userId, email]);

  if (!ready || loading) return null;
  if (hasAccess) return null;
  return <SubscriptionGate email={email} onSignOut={signOut} />;
}

export function AppRoot() {
  const { userId, email, verificationRequired, loggingIn, recheckUser } = useCurrentUser();
  useLoadingOverlay(loggingIn);

  if (loggingIn) return null;
  if (!userId) return <Login />;
  if (verificationRequired) return <VerifyEmail recheckUser={recheckUser} />;

  return (
    <SubscriptionProvider userId={userId}>
      <BootstrapAndLaunch userId={userId} email={email} />
    </SubscriptionProvider>
  );
}
