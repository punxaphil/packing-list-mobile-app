import { MembersScreen as MembersScreenComponent } from "~/components/members/MembersScreen";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

export function MembersScreen() {
  const { userId, email } = getAppState();

  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <MembersScreenComponent email={email} onProfile={pushProfile} />
      </AppProvider>
    </ScreenFrame>
  );
}
