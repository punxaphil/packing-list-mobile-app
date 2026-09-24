import type { ReactNode } from "react";
import { Login } from "~/components/auth/Auth";
import { VerifyEmail } from "~/components/auth/VerifyEmail";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { useCurrentUser } from "~/hooks/useCurrentUser.ts";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { setAppState } from "./appState";

type GateProps = { userId: string; email: string; children?: ReactNode };

function BootstrapAndLaunch({ userId, email, children }: GateProps) {
  const ready = useSpaceBootstrap(userId, email);

  if (!ready) return <AppLoadingState />;
  setAppState({ userId, email });
  return children;
}

export function AppRoot({ children }: { children?: ReactNode }) {
  const { userId, email, verificationRequired, loggingIn, recheckUser } = useCurrentUser();

  if (loggingIn) return <AppLoadingState />;
  if (!userId) return <Login />;
  if (verificationRequired) return <VerifyEmail recheckUser={recheckUser} />;

  return (
    <BootstrapAndLaunch userId={userId} email={email}>
      {children}
    </BootstrapAndLaunch>
  );
}
