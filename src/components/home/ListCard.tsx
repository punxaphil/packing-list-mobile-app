import { Pressable, Text, View } from "react-native";
import { EditableText } from "./EditableText.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { PackingListSummary, SelectionState } from "./types.ts";
import { ListActions, ListEditing } from "./listSectionState.ts";

type ListCardProps = {
  list: PackingListSummary;
  selection: SelectionState;
  editing: ListEditing;
  actions: ListActions;
  color: string;
};

type ListCardTextProps = {
  list: PackingListSummary;
  summary: string;
  editing: ListEditing;
  onRename: (list: PackingListSummary, name: string) => void;
};

type ListNameEditorProps = {
  list: PackingListSummary;
  editing: ListEditing;
  onRename: (list: PackingListSummary, name: string) => void;
};

export const ListCard = (props: ListCardProps) => {
  const summary = formatSummary(props.list);
  return (
    <Pressable style={getCardStyle(props.selection.selectedId === props.list.id, props.color)} onPress={() => props.selection.select(props.list.id)} accessibilityRole="button" accessibilityLabel={props.list.name} accessibilityHint={summary}>
      <ListCardText list={props.list} summary={summary} editing={props.editing} onRename={props.actions.onRename} />
      <ListDeleteButton onDelete={() => props.actions.onDelete(props.list)} />
    </Pressable>
  );
};

const ListCardText = ({ list, summary, editing, onRename }: ListCardTextProps) => (
  <View style={homeStyles.listCardText}>
    <ListNameEditor list={list} editing={editing} onRename={onRename} />
    <Text style={homeStyles.listSummary}>{summary}</Text>
  </View>
);

const ListNameEditor = ({ list, editing, onRename }: ListNameEditorProps) => (
  <EditableText
    value={list.name}
    onSubmit={(name) => onRename(list, name)}
    textStyle={homeStyles.listName}
    inputStyle={homeStyles.listName}
    containerStyle={homeStyles.listEditable}
    autoFocus={editing.editingId === list.id}
    onStart={() => editing.start(list.id)}
    onEnd={() => editing.stop(list.id)}
  />
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