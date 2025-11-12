import { Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { SelectionState } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";

type ListSectionProps = {
  lists: NamedEntity[];
  selection: SelectionState;
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

export const ListSection = ({ lists, selection }: ListSectionProps) => (
  <View style={homeStyles.listContainer}>
    <Text style={homeStyles.sectionTitle}>{HOME_COPY.listHeader}</Text>
    <View style={homeStyles.list}>
      {lists.map((list) => (
        <ListItem key={list.id} list={list} selection={selection} />
      ))}
    </View>
  </View>
);
