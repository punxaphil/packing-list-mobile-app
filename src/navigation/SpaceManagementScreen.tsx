import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "~/components/home/styles";
import { SpaceManagementScreen as SpaceMgmtContent } from "~/components/space/SpaceManagementScreen";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";

export function SpaceManagementScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <SpaceMgmtContent onBack={() => popScreen(componentId)} />
      </AppProvider>
    </SafeAreaView>
  );
}
