import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "~/components/home/styles";
import { ProfileScreen as ProfileScreenComponent } from "~/components/profile/ProfileScreen";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";

function ProfileContent({ componentId }: { componentId: string }) {
  const { email, signOut } = useApp();
  return <ProfileScreenComponent email={email} onSignOut={signOut} onBack={() => popScreen(componentId)} />;
}

export function ProfileScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ProfileContent componentId={componentId} />
      </AppProvider>
    </SafeAreaView>
  );
}
