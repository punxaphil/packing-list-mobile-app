import type { ReactNode } from "react";
import { Login } from "~/components/auth/Auth";
import { VerifyEmail } from "~/components/auth/VerifyEmail";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { SubscriptionGate } from "~/components/subscription/SubscriptionGate.tsx";
import { hasActiveAppAccessTrial } from "~/components/subscription/subscriptionAccess.ts";
import { useCurrentUser } from "~/hooks/useCurrentUser.ts";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { SubscriptionProvider } from "~/providers/SubscriptionProvider.tsx";
import { setAppState } from "./appState";
import { signOutUser } from "./signOut.ts";

type GateProps = { userId: string; email: string; children?: ReactNode };

const signOut = () => {
  signOutUser().catch(console.error);
};

function BootstrapAndLaunch({ userId, email, children }: GateProps) {
  const ready = useSpaceBootstrap(userId, email);
  const { isSubscribed, loading } = useSubscription();
  const hasAccess = hasActiveAppAccessTrial() || isSubscribed;

  if (!ready || loading) return <AppLoadingState />;
  if (!hasAccess) return <SubscriptionGate email={email} onSignOut={signOut} />;
  setAppState({ userId, email });
  return children;
}

export function AppRoot({ children }: { children?: ReactNode }) {
  const { userId, email, verificationRequired, loggingIn, recheckUser } = useCurrentUser();

  if (loggingIn) return <AppLoadingState />;
  if (!userId) return <Login />;
  if (verificationRequired) return <VerifyEmail recheckUser={recheckUser} />;

  return (
    <SubscriptionProvider userId={userId}>
      <BootstrapAndLaunch userId={userId} email={email}>
        {children}
      </BootstrapAndLaunch>
    </SubscriptionProvider>
  );
}
