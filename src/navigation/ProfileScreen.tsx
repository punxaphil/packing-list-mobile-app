import { ProfileScreen as ProfileScreenComponent } from "~/components/profile/ProfileScreen";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ProfileContent() {
  const { email, signOut } = useApp();
  return <ProfileScreenComponent email={email} onSignOut={signOut} onBack={popScreen} />;
}

export function ProfileScreen() {
  const { userId, email } = getAppState();
  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <ProfileContent />
      </AppProvider>
    </ScreenFrame>
  );
}
