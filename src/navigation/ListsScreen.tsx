import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { AppLoadingState, useDelayedLoading } from "~/components/shared/AppLoadingState.tsx";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, pushSpaceManagement, switchToItemsTab } from "./navigation";

function ListsContent({ componentId }: { componentId: string }) {
  const { email, lists, listsLoading, selection } = useApp();
  const showLoader = useDelayedLoading(listsLoading);

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (showLoader) return <AppLoadingState />;
  if (listsLoading) return null;

  return (
    <ListSection
      lists={lists}
      selection={selection}
      email={email}
      onProfile={() => pushProfile(componentId)}
      onManageSpace={() => pushSpaceManagement(componentId)}
      onListSelect={handleListSelect}
    />
  );
}

export function ListsScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ListsContent componentId={componentId} />
      </AppProvider>
    </SafeAreaView>
  );
}
