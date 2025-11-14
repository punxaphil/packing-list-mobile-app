import { GestureResponderEvent, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { PackingListSummary, SelectionState } from "./types.ts";
import { ListActions } from "./listSectionState.ts";
import { DragOffset, useDraggableRow } from "./useDraggableRow.tsx";

const DRAG_HANDLE_ICON = "≡";

type ListCardProps = {
  list: PackingListSummary;
  selection: SelectionState;
  actions: ListActions;
  color: string;
  hidden?: boolean;
  onLayout?: (layout: LayoutRectangle) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
};

export type ListCardTextProps = {
  list: PackingListSummary;
  summary: string;
};

export const ListCard = (props: ListCardProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  const summary = formatSummary(props.list);
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const dragHandle = (
    <Pressable
      style={homeStyles.listDragHandle}
      onPress={stopPropagation}
      onPressIn={stopPropagation}
      onPressOut={stopPropagation}
      accessibilityRole="button"
      accessibilityLabel={HOME_COPY.dragHandleLabel}
      hitSlop={8}
    >
      <Text style={homeStyles.listDragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
    </Pressable>
  );
  return (
    <View onLayout={handleLayout}>
      {wrap(
        <Pressable
          style={[getCardStyle(props.selection.selectedId === props.list.id, props.color), props.hidden ? { opacity: 0 } : null]}
          onPress={() => props.selection.select(props.list.id)}
          accessibilityRole="button"
          accessibilityLabel={props.list.name}
          accessibilityHint={summary}
        >
          <View style={homeStyles.listCardInner}>
            {dragHandle}
            <View style={homeStyles.listCardBody}>
              <ListCardText list={props.list} summary={summary} />
            </View>
            <ListDeleteButton onDelete={() => props.actions.onDelete(props.list)} />
          </View>
        </Pressable>,
      )}
    </View>
  );
};

export const ListCardText = ({ list, summary }: ListCardTextProps) => (
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

export const formatSummary = (list: PackingListSummary) => {
  const total = isNumber(list.itemCount) ? list.itemCount : 0;
  const packed = isNumber(list.packedCount) ? list.packedCount : 0;
  if (!total) return HOME_COPY.listNoItems;
  const itemsLabel = total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural;
  const packedLabel = packed === 1 ? HOME_COPY.packedSingular : HOME_COPY.packedPlural;
  return `${total} ${itemsLabel} (${packed} ${packedLabel})`;
};

export const ListCardPreview = ({ list, color }: { list: PackingListSummary; color: string }) => (
  <View style={getCardStyle(false, color)}>
    <View style={homeStyles.listCardInner}>
      <View style={homeStyles.listDragHandle}>
        <Text style={homeStyles.listDragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
      </View>
      <View style={homeStyles.listCardBody}>
        <ListCardText list={list} summary={formatSummary(list)} />
      </View>
      <View style={homeStyles.listDeleteButton}>
        <Text style={homeStyles.listDeleteIcon}>{HOME_COPY.deleteIcon}</Text>
      </View>
    </View>
  </View>
);

const stopPropagation = (event: GestureResponderEvent) => {
  event.stopPropagation();
};

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const getCardStyle = (selected: boolean, color: string) =>
  selected ? [homeStyles.listCard, homeStyles.listCardSelected, { backgroundColor: color }] : [homeStyles.listCard, { backgroundColor: color }];