import { memo, useEffect, useState } from "react";
import Checkbox from "expo-checkbox";
import { Animated, LayoutRectangle, Pressable, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";
import { SectionGroup } from "./itemsSectionHelpers.ts";
import { EditableText } from "./EditableText.tsx";
import { useDragState, DragSnapshot } from "./useDragState.ts";
import { computeDropIndex } from "./itemOrdering.ts";
import { useDraggableRow, DragOffset } from "./useDraggableRow.tsx";
import { AssignMembersModal } from "./AssignMembersModal.tsx";
import { MoveCategoryModal } from "./MoveCategoryModal.tsx";
import { CopyToListModal } from "./CopyToListModal.tsx";
import { PackingListSummary } from "./types.ts";
import { MultiCheckbox } from "./MultiCheckbox.tsx";
import { MemberInitials } from "./MemberInitials.tsx";
import { ActionMenu } from "./ActionMenu.tsx";
import type { SearchState } from "./useSearch.ts";

type CategorySectionProps = {
  section: SectionGroup;
  color: string;
  members: NamedEntity[];
  memberImages: Image[];
  categories: NamedEntity[];
  lists: NamedEntity[];
  currentListId: string;
  isTemplateList: boolean;
  search: SearchState;
  drag: ReturnType<typeof useDragState>;
  onDrop: (
    snapshot: DragSnapshot,
    layouts: Record<string, LayoutRectangle>,
    sectionLayouts: Record<string, LayoutRectangle>,
    bodyLayouts: Record<string, LayoutRectangle>
  ) => void;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
};

type CategoryEditing = {
  editingId: string | null;
  start: (id: string) => void;
  stop: (id: string) => void;
  active: (id: string) => boolean;
};

type CategoryItemRowProps = {
  item: PackItem;
  members: NamedEntity[];
  memberImages: Image[];
  editing: CategoryEditing;
  hidden: boolean;
  hasOtherLists: boolean;
  checkboxDisabled: boolean;
  isCurrentMatch: boolean;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onLayout: (layout: LayoutRectangle) => void;
  onDragStart: () => void;
  onDragMove: (offset: DragOffset) => void;
  onDragEnd: () => void;
  onOpenAssignMembers: () => void;
  onOpenMoveCategory: () => void;
  onOpenCopyToList: () => void;
  onToggleMemberPacked: (memberId: string) => void;
  onToggleAllMembers: (checked: boolean) => void;
};

export const CategorySection = (props: CategorySectionProps) => {
  const editing = useCategoryEditing();
  const [assignItem, setAssignItem] = useState<PackItem | null>(null);
  const [moveItem, setMoveItem] = useState<PackItem | null>(null);
  const [copyItem, setCopyItem] = useState<PackItem | null>(null);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  
  const onAdd = async () => editing.start((await props.onAddItem(props.section.category)).id);
  const handleMoveCategory = (category: NamedEntity) => {
    if (moveItem) props.onMoveCategory(moveItem, category.id);
  };
  const handleCopyToList = async (list: PackingListSummary) => {
    if (copyItem) await props.onCopyToList(copyItem, list.id);
  };
  const handleCategoryToggle = (checked: boolean) => {
    if (props.section.items.length > 30) setPendingToggle(checked);
    setTimeout(() => props.onToggleCategory(props.section.items, checked), 0);
  };

  const allChecked = props.section.items.every((item) => item.checked);
  useEffect(() => {
    if (pendingToggle !== null && pendingToggle === allChecked) {
      setPendingToggle(null);
    }
  }, [allChecked, pendingToggle]);

  return (
    <View
      style={[homeStyles.category, { backgroundColor: props.color }]}
      onLayout={(e) => props.drag.recordSectionLayout(props.section.category.id, e.nativeEvent.layout)}
    >
      <CategoryHeader section={props.section} isTemplateList={props.isTemplateList} onRenameCategory={props.onRenameCategory} editing={editing} onAdd={onAdd} onToggleCategory={handleCategoryToggle} pendingToggle={pendingToggle} />
      <CategoryItems {...props} editing={editing} onOpenAssignMembers={setAssignItem} onOpenMoveCategory={setMoveItem} onOpenCopyToList={setCopyItem} checkboxDisabled={props.isTemplateList} />
      {pendingToggle !== null && <View style={homeStyles.categoryOverlay} pointerEvents="box-only" />}
      <AssignMembersModal
        visible={!!assignItem}
        item={assignItem}
        members={props.members}
        onClose={() => setAssignItem(null)}
        onSave={props.onAssignMembers}
      />
      <MoveCategoryModal
        visible={!!moveItem}
        categories={props.categories}
        currentCategoryId={moveItem?.category ?? ""}
        onClose={() => setMoveItem(null)}
        onSelect={handleMoveCategory}
      />
      <CopyToListModal
        visible={!!copyItem}
        lists={props.lists}
        currentListId={props.currentListId}
        onClose={() => setCopyItem(null)}
        onSelect={handleCopyToList}
      />
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

type CategoryHeaderProps = {
  section: SectionGroup;
  isTemplateList: boolean;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  editing: CategoryEditing;
  onAdd: () => void;
  onToggleCategory: (checked: boolean) => void;
  pendingToggle: boolean | null;
};

const CategoryHeader = ({ section, isTemplateList, onToggleCategory, onRenameCategory, onAdd, editing, pendingToggle }: CategoryHeaderProps) => {
  const allChecked = section.items.every((item) => item.checked);
  const indeterminate = !allChecked && section.items.some((item) => item.checked);
  const displayChecked = pendingToggle ?? allChecked;
  
  return (
    <View style={homeStyles.categoryHeader}>
      <View style={homeStyles.categoryCheckboxWrapper}>
        <Checkbox
          value={displayChecked}
          onValueChange={onToggleCategory}
          style={homeStyles.checkbox}
          color={displayChecked ? homeColors.primary : undefined}
          disabled={isTemplateList || pendingToggle !== null}
        />
        {indeterminate && pendingToggle === null && <View pointerEvents="none" style={homeStyles.categoryCheckboxIndicator} />}
      </View>
      <EditableText
        value={section.category.name}
        onSubmit={(name) => onRenameCategory(section.category, name)}
        textStyle={homeStyles.categoryTitle}
        inputStyle={homeStyles.categoryInput}
        containerStyle={homeStyles.editable}
        onStart={() => editing.start(section.category.id)}
        onEnd={() => editing.stop(section.category.id)}
      />
      <Pressable style={homeStyles.addButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={HOME_COPY.addItem}>
        <Text style={homeStyles.addLabel}>+</Text>
      </Pressable>
    </View>
  );
};

type CategoryItemsProps = CategorySectionProps & {
  editing: CategoryEditing;
  onOpenAssignMembers: (item: PackItem) => void;
  onOpenMoveCategory: (item: PackItem) => void;
  onOpenCopyToList: (item: PackItem) => void;
  checkboxDisabled: boolean;
};

const CategoryItems = (props: CategoryItemsProps) => {
  const { section, lists, currentListId, search, drag, onToggle, onRenameItem, onDeleteItem, members, memberImages, onToggleMemberPacked, onToggleAllMembers, editing, onOpenAssignMembers, onOpenMoveCategory, onOpenCopyToList, onDrop, checkboxDisabled } = props;
  const items = section.items;
  const hasOtherLists = lists.filter((l) => l.id !== currentListId).length > 0;
  const { indicatorTargetId, indicatorBelow } = computeIndicator(items, drag, section.category.id);
  return (
    <View
      style={[homeStyles.categoryBody, { position: "relative" }]}
      onLayout={(e) => drag.recordBodyLayout(section.category.id, e.nativeEvent.layout)}
    >
      {items.map((item) => (
        <CategoryItemRow
          key={item.id}
          item={item}
          members={members}
          memberImages={memberImages}
          editing={editing}
          hidden={drag.snapshot?.id === item.id}
          hasOtherLists={hasOtherLists}
          checkboxDisabled={checkboxDisabled}
          isCurrentMatch={search.currentMatchId === item.id}
          onLayout={(layout) => drag.recordLayout(item.id, layout)}
          onDragStart={() => drag.start(item.id, item.category)}
          onDragMove={(offset) => drag.move(item.id, offset)}
          onDragEnd={() => drag.end((s) => s && onDrop(s, drag.layouts, drag.sectionLayouts, drag.bodyLayouts))}
          onToggle={onToggle}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          onOpenAssignMembers={() => onOpenAssignMembers(item)}
          onOpenMoveCategory={() => onOpenMoveCategory(item)}
          onOpenCopyToList={() => onOpenCopyToList(item)}
          onToggleMemberPacked={(memberId) => onToggleMemberPacked(item, memberId)}
          onToggleAllMembers={(checked) => onToggleAllMembers(item, checked)}
        />
      ))}
      <DropIndicator targetId={indicatorTargetId} layouts={drag.layouts} below={indicatorBelow} />
      <GhostRow items={items} drag={drag.snapshot} layouts={drag.layouts} />
    </View>
  );
};

const computeIndicator = (items: PackItem[], drag: ReturnType<typeof useDragState>, categoryId: string) => {
  const itemIds = items.map((i) => i.id);
  const dropIndex = computeDropIndex(itemIds, drag.snapshot, drag.layouts, drag.sectionLayouts, drag.bodyLayouts, categoryId);
  if (dropIndex === null) return { indicatorTargetId: null, indicatorBelow: false };
  if (dropIndex === items.length && items.length > 0) {
    return { indicatorTargetId: items[items.length - 1].id, indicatorBelow: true };
  }
  return { indicatorTargetId: items[dropIndex]?.id ?? null, indicatorBelow: false };
};

const areRowPropsEqual = (prev: CategoryItemRowProps, next: CategoryItemRowProps): boolean => {
  return (
    prev.item.id === next.item.id &&
    prev.item.checked === next.item.checked &&
    prev.item.name === next.item.name &&
    prev.item.members.length === next.item.members.length &&
    prev.item.members.every((m, i) => m.checked === next.item.members[i]?.checked) &&
    prev.hidden === next.hidden &&
    prev.hasOtherLists === next.hasOtherLists &&
    prev.checkboxDisabled === next.checkboxDisabled &&
    prev.isCurrentMatch === next.isCurrentMatch &&
    prev.editing.editingId === next.editing.editingId
  );
};

const CategoryItemRow = memo((props: CategoryItemRowProps) => {
  const dragHandlers = { onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd };
  const { wrap, dragging } = useDraggableRow(dragHandlers, { applyTranslation: false });
  const [menuVisible, setMenuVisible] = useState(false);
  const rowStyle = [homeStyles.itemContainer, props.hidden && { opacity: 0 }, dragging && { opacity: 0.5 }, props.isCurrentMatch && homeStyles.itemHighlight];
  const hasMembers = props.item.members.length > 0;
  const menuItems = [
    { text: "Edit Members", onPress: props.onOpenAssignMembers },
    { text: "Change Category", onPress: props.onOpenMoveCategory },
    ...(props.hasOtherLists ? [{ text: "Copy to List", onPress: props.onOpenCopyToList }] : []),
    { text: "Delete", style: "destructive" as const, onPress: () => handleDelete(props) },
    { text: "Cancel", style: "cancel" as const },
  ];
  return (
    <View onLayout={(e) => props.onLayout(e.nativeEvent.layout)}>
      <Pressable style={rowStyle}>
        {wrap(<DragHandle />)}
        {hasMembers ? (
          <MultiCheckbox item={props.item} disabled={props.checkboxDisabled} onToggle={props.onToggleAllMembers} />
        ) : (
          <Checkbox
            value={props.item.checked}
            onValueChange={() => props.onToggle(props.item)}
            color={props.item.checked ? homeColors.primary : undefined}
            style={homeStyles.checkbox}
            disabled={props.checkboxDisabled}
          />
        )}
        <View style={homeStyles.itemContent}>
          <EditableText
            value={props.item.name}
            onSubmit={(name) => props.onRenameItem(props.item, name)}
            textStyle={[homeStyles.detailLabel, props.item.checked && homeStyles.detailLabelChecked]}
            inputStyle={homeStyles.itemInput}
            autoFocus={props.editing.active(props.item.id)}
            onStart={() => props.editing.start(props.item.id)}
            onEnd={() => props.editing.stop(props.item.id)}
          />
          <MemberInitials
            item={props.item}
            members={props.members}
            memberImages={props.memberImages}
            onToggle={props.onToggleMemberPacked}
          />
        </View>
        <Pressable style={homeStyles.menuButton} onPress={() => setMenuVisible(true)} accessibilityRole="button" accessibilityLabel="Item menu">
          <Text style={homeStyles.menuIcon}>⋮</Text>
        </Pressable>
      </Pressable>
      <ActionMenu visible={menuVisible} title={props.item.name} items={menuItems} onClose={() => setMenuVisible(false)} />
    </View>
  );
}, areRowPropsEqual);

const handleDelete = (props: CategoryItemRowProps) => {
  props.onDeleteItem(props.item.id);
  props.editing.stop(props.item.id);
};

const DragHandle = () => (
  <View style={homeStyles.itemDragHandle}>
    <Text style={homeStyles.itemDragHandleIcon}>≡</Text>
  </View>
);

type GhostRowProps = { items: PackItem[]; drag: DragSnapshot; layouts: Record<string, LayoutRectangle> };

const GhostRow = ({ items, drag, layouts }: GhostRowProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const item = items.find((i) => i.id === drag.id);
  if (!item) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[homeStyles.itemGhost, { top: layout.y + drag.offsetY, height: layout.height }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 0, height: "100%" }}>
        <DragHandle />
        <View style={[homeStyles.checkbox, { borderColor: homeColors.border, borderWidth: 1, marginRight: 8 }]} />
        <Text style={[homeStyles.detailLabel, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
      </View>
    </Animated.View>
  );
};

type DropIndicatorProps = { targetId: string | null; layouts: Record<string, LayoutRectangle>; below: boolean };

const DropIndicator = ({ targetId, layouts, below }: DropIndicatorProps) => {
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[homeStyles.itemIndicator, { top }]} />;
};
