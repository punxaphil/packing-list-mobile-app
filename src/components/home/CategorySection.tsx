import { useState } from "react";
import Checkbox from "expo-checkbox";
import { Animated, LayoutRectangle, Pressable, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";
import { SectionGroup } from "./itemsSectionHelpers.ts";
import { EditableText } from "./EditableText.tsx";
import { useDragState, DragSnapshot } from "./useDragState.ts";
import { useItemOrdering, computeDropIndex } from "./itemOrdering.ts";
import { useDraggableRow, DragOffset } from "./useDraggableRow.tsx";

type CategorySectionProps = {
  section: SectionGroup;
  color: string;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

type CategoryEditing = {
  editingId: string | null;
  start: (id: string) => void;
  stop: (id: string) => void;
  active: (id: string) => boolean;
};

type CategoryStatus = {
  allChecked: boolean;
  indeterminate: boolean;
};

type CategoryHeaderProps = CategorySectionProps & {
  editing: CategoryEditing;
  onAdd: () => void;
};

type CategoryItemsProps = CategorySectionProps & {
  items: PackItem[];
  editing: CategoryEditing;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => void;
};

type CategoryItemRowProps = {
  item: PackItem;
  editing: CategoryEditing;
  hidden: boolean;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onLayout: (layout: LayoutRectangle) => void;
  onDragStart: () => void;
  onDragMove: (offset: DragOffset) => void;
  onDragEnd: () => void;
};

export const CategorySection = (props: CategorySectionProps) => {
  const editing = useCategoryEditing();
  const ordering = useItemOrdering(props.section.items);
  const drag = useDragState();
  const onAdd = async () => editing.start((await props.onAddItem(props.section.category)).id);
  return (
    <View style={[homeStyles.category, { backgroundColor: props.color }]}>
      <CategoryHeader {...props} editing={editing} onAdd={onAdd} />
      <CategoryItems {...props} items={ordering.items} editing={editing} drag={drag} onDrop={ordering.drop} />
    </View>
  );
};

const useCategoryEditing = (): CategoryEditing => {
  const [editingId, setEditingId] = useState<string | null>(null);
  return {
    editingId,
    start: setEditingId,
    stop: (id: string) => setEditingId((current) => (current === id ? null : current)),
    active: (id: string) => editingId === id,
  };
};

const getCategoryStatus = (items: PackItem[]): CategoryStatus => {
  const allChecked = items.every((item) => item.checked);
  return { allChecked, indeterminate: !allChecked && items.some((item) => item.checked) };
};

const CategoryHeader = ({ section, onToggleCategory, onRenameCategory, onAdd, editing }: CategoryHeaderProps) => {
  const status = getCategoryStatus(section.items);
  return (
    <View style={homeStyles.categoryHeader}>
      <CategoryCheckbox items={section.items} status={status} onToggleCategory={onToggleCategory} />
      <EditableText value={section.category.name} onSubmit={(name) => onRenameCategory(section.category, name)} textStyle={homeStyles.categoryTitle} inputStyle={homeStyles.categoryInput} containerStyle={homeStyles.editable} onStart={() => editing.start(section.category.id)} onEnd={() => editing.stop(section.category.id)} />
      <Pressable style={homeStyles.addButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={HOME_COPY.addItem}>
        <Text style={homeStyles.addLabel}>+</Text>
      </Pressable>
    </View>
  );
};

const CategoryCheckbox = ({ items, status, onToggleCategory }: { items: PackItem[]; status: CategoryStatus; onToggleCategory: (items: PackItem[], checked: boolean) => void }) => (
  <View style={homeStyles.categoryCheckboxWrapper}>
    <Checkbox value={status.allChecked} onValueChange={(checked) => onToggleCategory(items, checked)} style={homeStyles.checkbox} color={status.allChecked ? homeColors.primary : undefined} />
    {status.indeterminate && <View pointerEvents="none" style={homeStyles.categoryCheckboxIndicator} />}
  </View>
);

const CategoryItems = ({ items, editing, drag, onDrop, onToggle, onRenameItem, onDeleteItem }: CategoryItemsProps) => {
  const itemIds = items.map((i) => i.id);
  const dropIndex = computeDropIndex(itemIds, drag.snapshot, drag.layouts);
  const originalIndex = drag.snapshot ? itemIds.indexOf(drag.snapshot.id) : -1;
  const showBelow = dropIndex !== null && dropIndex !== originalIndex && (drag.snapshot?.offsetY ?? 0) > 0;
  return (
    <View style={[homeStyles.categoryBody, { position: "relative" }]}>
      {items.map((item) => (
        <CategoryItemRow
          key={item.id}
          item={item}
          editing={editing}
          hidden={drag.snapshot?.id === item.id}
          onLayout={(layout) => drag.recordLayout(item.id, layout)}
          onDragStart={() => drag.start(item.id)}
          onDragMove={(offset) => drag.move(item.id, offset)}
          onDragEnd={() => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts))}
          onToggle={onToggle}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
        />
      ))}
      <DropIndicator dropIndex={dropIndex} items={items} layouts={drag.layouts} below={showBelow} />
      <GhostRow items={items} drag={drag.snapshot} layouts={drag.layouts} />
    </View>
  );
};

const CategoryItemRow = (props: CategoryItemRowProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  return (
    <View onLayout={(e) => props.onLayout(e.nativeEvent.layout)}>
      {wrap(
        <View style={[homeStyles.detailItem, props.hidden ? { opacity: 0 } : null]}>
          <DragHandle />
          <Checkbox value={props.item.checked} onValueChange={() => props.onToggle(props.item)} color={props.item.checked ? homeColors.primary : undefined} style={homeStyles.checkbox} />
          <EditableText
            value={props.item.name}
            onSubmit={(name) => props.onRenameItem(props.item, name)}
            textStyle={[homeStyles.detailLabel, props.item.checked && homeStyles.detailLabelChecked]}
            inputStyle={homeStyles.itemInput}
            autoFocus={props.editing.active(props.item.id)}
            onStart={() => props.editing.start(props.item.id)}
            onEnd={() => props.editing.stop(props.item.id)}
            containerStyle={homeStyles.editable}
          />
          <Pressable style={homeStyles.deleteButton} onPress={() => { props.onDeleteItem(props.item.id); props.editing.stop(props.item.id); }} accessibilityRole="button" accessibilityLabel={HOME_COPY.deleteItem}>
            <Text style={homeStyles.deleteLabel}>×</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const DragHandle = () => (
  <View style={homeStyles.itemDragHandle}>
    <Text style={homeStyles.itemDragHandleIcon}>≡</Text>
  </View>
);

const GhostRow = ({ items, drag, layouts }: { items: PackItem[]; drag: DragSnapshot; layouts: Record<string, LayoutRectangle> }) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const item = items.find((i) => i.id === drag.id);
  if (!item) return null;
  return (
    <Animated.View pointerEvents="none" style={[homeStyles.itemGhost, { top: layout.y + drag.offsetY, height: layout.height }]}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 0, height: "100%" }}>
        <DragHandle />
        <View style={[homeStyles.checkbox, { borderColor: homeColors.border, borderWidth: 1, marginRight: 8 }]} />
        <Text style={[homeStyles.detailLabel, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
      </View>
    </Animated.View>
  );
};

const DropIndicator = ({ dropIndex, items, layouts, below }: { dropIndex: number | null; items: PackItem[]; layouts: Record<string, LayoutRectangle>; below: boolean }) => {
  if (dropIndex === null) return null;
  const targetId = items[dropIndex]?.id;
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[homeStyles.itemIndicator, { top }]} />;
};
