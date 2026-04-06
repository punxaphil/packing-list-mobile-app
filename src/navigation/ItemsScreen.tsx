import { Text, View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemsSection } from "~/components/home/ItemsSection";
import { HOME_COPY, homeStyles } from "~/components/home/styles";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { useCategories } from "~/hooks/useCategories";
import { useImages } from "~/hooks/useImages";
import { useMembers } from "~/hooks/useMembers";
import { usePackingItems } from "~/hooks/usePackingItems";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, pushSpaceManagement } from "./navigation";

function ItemsContent({ componentId }: { componentId: string }) {
  const { email, spaceId, lists, hasLists, listsLoading, selection } = useApp();
  const categoriesState = useCategories(spaceId);
  const membersState = useMembers(spaceId);
  const imagesState = useImages(spaceId);
  const itemsState = usePackingItems(spaceId, selection.selectedId);

  if (listsLoading) return <AppLoadingState label={HOME_COPY.loading} />;
  if (itemsState.loading) return <AppLoadingState label={HOME_COPY.itemsLoading} />;

  if (!hasLists) {
    return (
      <SafeAreaView edges={["top"]} style={homeStyles.home}>
        <View style={homeStyles.loading}>
          <Text>No lists yet. Create one in the Lists tab.</Text>
        </View>
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
        onManageSpace={() => pushSpaceManagement(componentId)}
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
