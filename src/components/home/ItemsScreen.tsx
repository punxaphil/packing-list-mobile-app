import { View, Text } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { homeStyles } from "./styles.ts";
import { SelectionState } from "./types.ts";
import { ItemsSection } from "./ItemsSection.tsx";

type ItemsScreenProps = {
  userId: string;
  email: string;
  hasLists: boolean;
  selection: SelectionState;
  onProfile: () => void;
};

export const ItemsScreen = ({ userId, email, hasLists, selection, onProfile }: ItemsScreenProps) => {
  const categoriesState = useCategories(userId);
  const itemsState = usePackingItems(userId, selection.selectedId);

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
