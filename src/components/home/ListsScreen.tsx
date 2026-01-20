import { View } from "react-native";
import { ListSection } from "./ListSection.tsx";
import { EmptyList } from "./EmptyList.tsx";
import { homeStyles } from "./styles.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

type ListsScreenProps = {
  email: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  selection: SelectionState;
  onListSelect: (id: string) => void;
  onProfile: () => void;
};

export const ListsScreen = ({ hasLists, lists, selection, email, onProfile, onListSelect }: ListsScreenProps) => {
  if (!hasLists) return <EmptyList />;

  return (
    <View style={homeStyles.home}>
      <ListSection lists={lists} selection={selection} email={email} onProfile={onProfile} onListSelect={onListSelect} />
    </View>
  );
};
