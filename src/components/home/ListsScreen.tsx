import { ActivityIndicator, View } from "react-native";
import { ListSection } from "./ListSection.tsx";
import { EmptyList } from "./EmptyList.tsx";
import { homeColors } from "./theme.ts";
import { homeStyles } from "./styles.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

type ListsScreenProps = {
  email: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  listsLoading: boolean;
  selection: SelectionState;
  onListSelect: (id: string) => void;
  onProfile: () => void;
};

export const ListsScreen = ({ hasLists, listsLoading, lists, selection, email, onProfile, onListSelect }: ListsScreenProps) => {
  if (listsLoading) {
    return (
      <View style={homeStyles.home}>
        <View style={homeStyles.loading}>
          <ActivityIndicator size="large" color={homeColors.primary} />
        </View>
      </View>
    );
  }

  if (!hasLists) return <EmptyList />;

  return (
    <View style={homeStyles.home}>
      <ListSection lists={lists} selection={selection} email={email} onProfile={onProfile} onListSelect={onListSelect} />
    </View>
  );
};
