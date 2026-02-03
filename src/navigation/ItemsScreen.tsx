import { useCallback, useState } from "react";
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
import { getProfileImage } from "~/services/utils";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";
import { useTopBar } from "./useTopBar.ts";

function ItemsContent({ componentId }: { componentId: string }) {
  const { userId, email, lists, hasLists, listsLoading, selection } = useApp();
  const categoriesState = useCategories(userId);
  const membersState = useMembers(userId);
  const imagesState = useImages(userId);
  const itemsState = usePackingItems(userId, selection.selectedId);
  const profileImage = getProfileImage(imagesState.images);
  const [filterActive, setFilterActive] = useState(false);
  const [filterTrigger, setFilterTrigger] = useState(0);

  const handleFilterStateChange = useCallback((hasFilter: boolean) => {
    setFilterActive(hasFilter);
  }, []);

  useTopBar({
    componentId,
    title: "Items",
    profileImageUrl: profileImage?.url,
    onProfile: () => pushProfile(componentId),
    showFilter: true,
    filterActive,
    onFilter: () => setFilterTrigger((t) => t + 1),
  });

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
      filterTrigger={filterTrigger}
      onFilterStateChange={handleFilterStateChange}
    />
  );
}

export function ItemsScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={[]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ItemsContent componentId={componentId} />
      </AppProvider>
    </SafeAreaView>
  );
}
