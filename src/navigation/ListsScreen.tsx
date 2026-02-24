import { ActivityIndicator, View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, pushSpaceManagement, switchToItemsTab } from "./navigation";

function ListsContent({ componentId }: { componentId: string }) {
  const { email, lists, listsLoading, selection } = useApp();

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (listsLoading) {
    return (
      <View style={homeStyles.loading}>
        <ActivityIndicator size="large" color={homeColors.primary} />
      </View>
    );
  }

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
