import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";
import { useLoadingOverlay } from "./useLoadingOverlay.ts";

function ListsContent({ componentId }: { componentId: string }) {
  const { email, lists, listsLoading, selection } = useApp();
  useLoadingOverlay(listsLoading);

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (listsLoading) return null;

  return (
    <ListSection
      lists={lists}
      selection={selection}
      email={email}
      onProfile={() => pushProfile(componentId)}
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
