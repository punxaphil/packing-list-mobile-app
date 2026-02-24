import { ActivityIndicator, Text, View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemsSection } from "~/components/home/ItemsSection";
import { homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
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

  if (listsLoading) {
    return (
      <View style={homeStyles.loading}>
        <ActivityIndicator size="large" color={homeColors.primary} />
      </View>
    );
  }

  if (!hasLists) {
    return (
      <View style={homeStyles.loading}>
        <Text>No lists yet. Create one in the Lists tab.</Text>
      </View>
    );
  }

  return (
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
  );
}

export function ItemsScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ItemsContent componentId={componentId} />
      </AppProvider>
    </SafeAreaView>
  );
}
