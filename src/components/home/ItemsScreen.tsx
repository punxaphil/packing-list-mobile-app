import { ActivityIndicator, View, Text } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { homeColors } from "./theme.ts";
import { homeStyles } from "./styles.ts";
import { SelectionState } from "./types.ts";
import { ItemsSection } from "./ItemsSection.tsx";

type ItemsScreenProps = {
  userId: string;
  email: string;
  hasLists: boolean;
  listsLoading: boolean;
  selection: SelectionState;
  onProfile: () => void;
};

export const ItemsScreen = ({ userId, email, hasLists, listsLoading, selection, onProfile }: ItemsScreenProps) => {
  const categoriesState = useCategories(userId);
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
      <ItemsSection selection={selection} categoriesState={categoriesState} itemsState={itemsState} email={email} onProfile={onProfile} />
    </View>
  );
};
