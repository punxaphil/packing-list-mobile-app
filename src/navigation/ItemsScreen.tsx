import { View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemsSection } from "~/components/home/ItemsSection";
import { homeStyles } from "~/components/home/styles";
import { AppLoadingState, useDelayedLoading } from "~/components/shared/AppLoadingState.tsx";
import { useCategories } from "~/hooks/useCategories";
import { useImages } from "~/hooks/useImages";
import { useMembers } from "~/hooks/useMembers";
import { usePackingItems } from "~/hooks/usePackingItems";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";

function ItemsContent({ componentId }: { componentId: string }) {
  const { email, spaceId, lists, hasLists, listsLoading, selection } = useApp();
  const categoriesState = useCategories(spaceId);
  const membersState = useMembers(spaceId);
  const imagesState = useImages(spaceId);
  const itemsState = usePackingItems(spaceId, selection.selectedId);
  const loading = listsLoading || itemsState.loading;
  const showLoader = useDelayedLoading(loading);

  if (showLoader) return <AppLoadingState />;
  if (loading) return null;

  if (!hasLists) {
    return (
      <SafeAreaView edges={["top"]} style={homeStyles.home}>
        <View style={homeStyles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <ItemsSection
        selection={selection}
        categoriesState={categoriesState}
        itemsState={itemsState}
        membersState={membersState}
        imagesState={imagesState}
        lists={lists}
        email={email}
        onProfile={() => pushProfile(componentId)}
      />
    </SafeAreaView>
  );
}

export function ItemsScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <AppProvider userId={userId} email={email}>
      <ItemsContent componentId={componentId} />
    </AppProvider>
  );
}
