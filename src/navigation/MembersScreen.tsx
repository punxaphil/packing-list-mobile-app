import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "~/components/home/styles";
import { MembersScreen as MembersScreenComponent } from "~/components/members/MembersScreen";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";

export function MembersScreen() {
  const { userId, email } = getAppState();

  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <MembersScreenComponent email={email} onProfile={pushProfile} />
      </AppProvider>
    </SafeAreaView>
  );
}
