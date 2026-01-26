import { ActivityIndicator, View, Text } from "react-native";
import { router } from "expo-router";
import { useCategories } from "~/hooks/useCategories.ts";
import { useImages } from "~/hooks/useImages.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { homeColors } from "~/components/home/theme.ts";
import { homeStyles } from "~/components/home/styles.ts";
import { ItemsSection } from "~/components/home/ItemsSection.tsx";
import { useApp } from "~/providers/AppProvider.tsx";

export default function ItemsTab() {
  const { userId, email, lists, hasLists, listsLoading, selection } = useApp();
  const categoriesState = useCategories(userId);
  const membersState = useMembers(userId);
  const imagesState = useImages(userId);
  const itemsState = usePackingItems(userId, selection.selectedId);

  if (listsLoading) {
    return (
      <View style={homeStyles.home}>
        <View style={homeStyles.loading}>
          <ActivityIndicator size="large" color={homeColors.primary} />
        </View>
      </View>
    );
  }

  if (!hasLists) {
    return (
      <View style={homeStyles.home}>
        <View style={homeStyles.loading}>
          <Text>No lists yet. Create one in the Lists tab.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={homeStyles.home}>
      <ItemsSection
        selection={selection}
        categoriesState={categoriesState}
        itemsState={itemsState}
        membersState={membersState}
        imagesState={imagesState}
        lists={lists}
        email={email}
        onProfile={() => router.push("/(tabs)/profile")}
      />
    </View>
  );
}
