import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListChangesScreen as ListChangesScreenComponent } from "~/components/home/ListChangesScreen";
import { homeStyles } from "~/components/home/styles";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";

function ListChangesContent({ componentId, packingListId }: { componentId: string; packingListId: string }) {
  const { spaceId } = useApp();
  return (
    <ListChangesScreenComponent spaceId={spaceId} packingListId={packingListId} onBack={() => popScreen(componentId)} />
  );
}

type ScreenProps = NavigationComponentProps & { packingListId: string };

export function ListChangesScreen({ componentId, packingListId }: ScreenProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ListChangesContent componentId={componentId} packingListId={packingListId} />
      </AppProvider>
    </SafeAreaView>
  );
}
