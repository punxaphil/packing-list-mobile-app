import { Alert, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { PackingListSummary } from "./types.ts";
import { ListActions } from "./listSectionState.ts";
import { DragOffset, useDraggableRow } from "./useDraggableRow.tsx";

const DRAG_HANDLE_ICON = "≡";
const MENU_ICON = "⋮";

type ListCardProps = {
  list: PackingListSummary;
  isSelected: boolean;
  actions: ListActions;
  color: string;
  hidden?: boolean;
  onLayout?: (layout: LayoutRectangle) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
  onSelect: (id: string) => void;
};

export type ListCardTextProps = {
  list: PackingListSummary;
  summary: string;
};

export const ListCard = (props: ListCardProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  const summary = formatSummary(props.list);
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const showMenu = () => {
    const isTemplate = props.list.isTemplate === true;
    const templateAction = isTemplate
      ? { text: "Remove Template", onPress: () => void props.actions.onRemoveTemplate(props.list) }
      : { text: "Set as Template", onPress: () => void props.actions.onSetTemplate(props.list) };
    Alert.alert(props.list.name, undefined, [
      templateAction,
      { text: "Delete", style: "destructive" as const, onPress: () => void props.actions.onDelete(props.list) },
      { text: "Cancel", style: "cancel" as const },
    ]);
  };
  return (
    <View onLayout={handleLayout}>
      <Pressable
        style={[getCardStyle(props.isSelected, props.color), props.hidden ? { opacity: 0 } : null]}
        onPress={() => props.onSelect(props.list.id)}
        accessibilityRole="button"
        accessibilityLabel={props.list.name}
        accessibilityHint={summary}
      >
        <View style={homeStyles.listCardInner}>
          {wrap(<DragHandle />)}
          <View style={homeStyles.listCardBody}>
            <ListCardText list={props.list} summary={summary} />
          </View>
          <ListMenuButton onPress={showMenu} />
        </View>
      </Pressable>
    </View>
  );
};

const DragHandle = () => (
  <View style={homeStyles.listDragHandle}>
    <Text style={homeStyles.listDragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

export const ListCardText = ({ list, summary }: ListCardTextProps) => (
  <View style={homeStyles.listCardText}>
    <View style={homeStyles.listNameRow}>
      <Text style={homeStyles.listName}>{list.name}</Text>
      {list.isTemplate && <TemplateBadge />}
    </View>
    <Text style={homeStyles.listSummary}>{summary}</Text>
  </View>
);

const TemplateBadge = () => (
  <View style={homeStyles.templateBadge}>
    <Text style={homeStyles.templateBadgeText}>Template</Text>
  </View>
);

const ListMenuButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={homeStyles.listDeleteButton} onPress={onPress} accessibilityRole="button" accessibilityLabel="List menu">
    <Text style={homeStyles.listDeleteIcon}>{MENU_ICON}</Text>
  </Pressable>
);

export const formatSummary = (list: PackingListSummary) => {
  const total = isNumber(list.itemCount) ? list.itemCount : 0;
  const packed = isNumber(list.packedCount) ? list.packedCount : 0;
  if (!total) return HOME_COPY.listNoItems;
  if (list.isTemplate) return `${total} ${total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural}`;
  const itemsLabel = total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural;
  const packedLabel = packed === 1 ? HOME_COPY.packedSingular : HOME_COPY.packedPlural;
  return `${total} ${itemsLabel} (${packed} ${packedLabel})`;
};

export const ListCardPreview = ({ list, color }: { list: PackingListSummary; color: string }) => (
  <View style={[getCardStyle(false, color), { flex: 1 }]}>
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

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const getCardStyle = (selected: boolean, color: string) =>
  selected ? [homeStyles.listCard, homeStyles.listCardSelected, { backgroundColor: color }] : [homeStyles.listCard, { backgroundColor: color }];