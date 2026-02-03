import { getAuth } from "firebase/auth";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "~/components/home/styles";
import { ProfileScreen as ProfileScreenComponent } from "~/components/profile/ProfileScreen";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";

const signOut = () => getAuth().signOut().catch(console.error);

export function ProfileScreen(_: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ProfileScreenComponent userId={userId} email={email} onSignOut={signOut} />
      </AppProvider>
    </SafeAreaView>
  );
}
