import { Pressable, Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { PackingListSummary, SelectionState } from "./types.ts";
import { ListActions } from "./listSectionState.ts";

type ListCardProps = {
  list: PackingListSummary;
  selection: SelectionState;
  actions: ListActions;
  color: string;
};

type ListCardTextProps = {
  list: PackingListSummary;
  summary: string;
};

export const ListCard = (props: ListCardProps) => {
  const summary = formatSummary(props.list);
  return (
    <Pressable style={getCardStyle(props.selection.selectedId === props.list.id, props.color)} onPress={() => props.selection.select(props.list.id)} accessibilityRole="button" accessibilityLabel={props.list.name} accessibilityHint={summary}>
      <ListCardText list={props.list} summary={summary} />
      <ListDeleteButton onDelete={() => props.actions.onDelete(props.list)} />
    </Pressable>
  );
};

const ListCardText = ({ list, summary }: ListCardTextProps) => (
  <View style={homeStyles.listCardText}>
    <Text style={homeStyles.listName}>{list.name}</Text>
    <Text style={homeStyles.listSummary}>{summary}</Text>
  </View>
);

const ListDeleteButton = ({ onDelete }: { onDelete: () => Promise<void> }) => (
  <Pressable style={homeStyles.listDeleteButton} onPress={() => void onDelete()} accessibilityRole="button" accessibilityLabel={HOME_COPY.deleteList}>
    <Text style={homeStyles.listDeleteIcon}>{HOME_COPY.deleteIcon}</Text>
  </Pressable>
);

const formatSummary = (list: PackingListSummary) => {
  const total = isNumber(list.itemCount) ? list.itemCount : 0;
  const packed = isNumber(list.packedCount) ? list.packedCount : 0;
  if (!total) return HOME_COPY.listNoItems;
  const itemsLabel = total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural;
  const packedLabel = packed === 1 ? HOME_COPY.packedSingular : HOME_COPY.packedPlural;
  return `${total} ${itemsLabel} (${packed} ${packedLabel})`;
};

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const getCardStyle = (selected: boolean, color: string) =>
  selected ? [homeStyles.listCard, homeStyles.listCardSelected, { backgroundColor: color }] : [homeStyles.listCard, { backgroundColor: color }];