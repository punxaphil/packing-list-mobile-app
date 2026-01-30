import { ActivityIndicator, View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyList } from "~/components/home/EmptyList";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
import { useImages } from "~/hooks/useImages";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";

function ListsContent({ componentId }: { componentId: string }) {
  const { userId, email, lists, hasLists, listsLoading, selection } = useApp();
  const imagesState = useImages(userId);

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

  if (!hasLists) return <EmptyList />;

  return (
    <ListSection
      lists={lists}
      selection={selection}
      email={email}
      images={imagesState.images}
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
