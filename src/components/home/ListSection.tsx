import { ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { SelectionState } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";

type ListSectionProps = {
  lists: NamedEntity[];
  selection: SelectionState;
  email: string;
  onSignOut: () => void;
};

const getItemStyle = (selection: SelectionState, id: string) =>
  id === selection.selectedId
    ? [homeStyles.listItem, homeStyles.activeItem]
    : homeStyles.listItem;

const ListItem = ({
  list,
  selection,
}: {
  list: NamedEntity;
  selection: SelectionState;
}) => (
  <Text
    style={getItemStyle(selection, list.id)}
    onPress={() => selection.select(list.id)}
  >
    {list.name}
  </Text>
);

export const ListSection = ({ lists, selection, email, onSignOut }: ListSectionProps) => (
  <View style={homeStyles.panel}>
    <HomeHeader title={HOME_COPY.listHeader} email={email} onSignOut={onSignOut} />
    <ScrollView
      style={homeStyles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={homeStyles.list}>
        {lists.map((list) => (
          <ListItem key={list.id} list={list} selection={selection} />
        ))}
      </View>
    </ScrollView>
  </View>
);
