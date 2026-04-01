import Checkbox from "expo-checkbox";
import { memo, useEffect, useState } from "react";
import { Animated, LayoutRectangle, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AssignMembersModal } from "./AssignMembersModal.tsx";
import { CopyToListModal } from "./CopyToListModal.tsx";
import { EditableText } from "./EditableText.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { computeDropIndex } from "./itemOrdering.ts";
import { SectionGroup } from "./itemsSectionHelpers.ts";
import { MemberInitials } from "./MemberInitials.tsx";
import { MoveCategoryModal } from "./MoveCategoryModal.tsx";
import { MultiCheckbox } from "./MultiCheckbox.tsx";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { useToast } from "./Toast.tsx";
import { homeColors } from "./theme.ts";
import { PackingListSummary } from "./types.ts";
import { DragOffset, useDraggableRow } from "./useDraggableRow.tsx";
import { DragSnapshot, useDragState } from "./useDragState.ts";
import type { SearchState } from "./useSearch.ts";

type CategorySectionProps = {
  section: SectionGroup;
  color: string;
  members: NamedEntity[];
  memberImages: Image[];
  categoryImages: Image[];
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  categories: NamedEntity[];
  lists: NamedEntity[];
  currentListId: string;
  isTemplateList: boolean;
  search: SearchState;
  drag: ReturnType<typeof useDragState>;
  highlightId: string | null;
  highlightOpacity: Animated.Value;
  onDrop: (
    snapshot: DragSnapshot,
    layouts: Record<string, LayoutRectangle>,
    sectionLayouts: Record<string, LayoutRectangle>,
    bodyLayouts: Record<string, LayoutRectangle>
  ) => void;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => void;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
  onSortCategoryAlpha: (items: PackItem[]) => Promise<void>;
};

type CategoryEditing = {
  editingId: string | null;
  start: (id: string) => void;
  stop: (id: string) => void;
  active: (id: string) => boolean;
};

type CategoryItemRowProps = {
  item: PackItem;
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  memberImages: Image[];
  editing: CategoryEditing;
  hidden: boolean;
  highlightOpacity: Animated.Value | undefined;
  hasOtherLists: boolean;
  checkboxDisabled: boolean;
  isCurrentMatch: boolean;
  validateItemName: (name: string) => boolean;
  onDuplicateName: () => void;
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

const CategorySectionImpl = (props: CategorySectionProps) => {
  const editing = useCategoryEditing();
  const [assignItem, setAssignItem] = useState<PackItem | null>(null);
  const [moveItem, setMoveItem] = useState<PackItem | null>(null);
  const [copyItem, setCopyItem] = useState<PackItem | null>(null);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onAdd = () => props.onAddItem(props.section.category);
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

  const categoryImageUrl = props.categoryImages.find((img) => img.typeId === props.section.category.id)?.url;

  return (
    <View
      style={[homeStyles.category, { backgroundColor: props.color }]}
      onLayout={(e) => props.drag.recordSectionLayout(props.section.category.id, e.nativeEvent.layout)}
    >
      <CategoryHeader
        section={props.section}
        imageUrl={categoryImageUrl}
        isTemplateList={props.isTemplateList}
        onRenameCategory={props.onRenameCategory}
        editing={editing}
        onAdd={onAdd}
        onToggleCategory={handleCategoryToggle}
        pendingToggle={pendingToggle}
        onSortAlpha={() => props.onSortCategoryAlpha(props.section.items)}
        onDeleteItems={() => setConfirmDelete(true)}
      />
      <CategoryItems
        {...props}
        editing={editing}
        onOpenAssignMembers={setAssignItem}
        onOpenMoveCategory={setMoveItem}
        onOpenCopyToList={setCopyItem}
        checkboxDisabled={props.isTemplateList}
      />
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
      <DialogShell
        visible={confirmDelete}
        title={HOME_COPY.categoryMenuDeleteItems}
        onClose={() => setConfirmDelete(false)}
        actions={
          <DialogActions
            cancelLabel={DELETE_COPY.cancel}
            confirmLabel={DELETE_COPY.confirm}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              setConfirmDelete(false);
              for (const item of props.section.items) props.onDeleteItem(item.id);
            }}
          />
        }
      >
        <Text style={deleteStyles.body}>
          {DELETE_COPY.body
            .replace("{count}", String(props.section.items.length))
            .replace("{name}", props.section.category.name)}
        </Text>
      </DialogShell>
    </View>
  );
};

const areSectionPropsEqual = (prev: CategorySectionProps, next: CategorySectionProps): boolean => {
  if (prev.section.category.id !== next.section.category.id) return false;
  if (prev.section.items.length !== next.section.items.length) return false;
  for (let i = 0; i < prev.section.items.length; i++) {
    const pItem = prev.section.items[i];
    const nItem = next.section.items[i];
    if (pItem.id !== nItem.id || pItem.checked !== nItem.checked || pItem.name !== nItem.name) return false;
    if (pItem.members.length !== nItem.members.length) return false;
    for (let j = 0; j < pItem.members.length; j++) {
      if (pItem.members[j].checked !== nItem.members[j].checked) return false;
    }
  }
  if (prev.color !== next.color) return false;
  if (prev.isTemplateList !== next.isTemplateList) return false;
  if (prev.search.currentMatchId !== next.search.currentMatchId) return false;
  if (prev.drag.snapshot?.id !== next.drag.snapshot?.id) return false;
  if (prev.drag.snapshot?.offsetY !== next.drag.snapshot?.offsetY) return false;
  if (prev.drag.snapshot?.frozenY !== next.drag.snapshot?.frozenY) return false;
  if (prev.highlightId !== next.highlightId) return false;
  if (prev.initialsMap !== next.initialsMap) return false;
  if (prev.memberNames !== next.memberNames) return false;
  if (prev.memberImages !== next.memberImages) return false;
  if (prev.categoryImages !== next.categoryImages) return false;
  return true;
};

export const CategorySection = memo(CategorySectionImpl, areSectionPropsEqual);

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
  imageUrl: string | undefined;
  isTemplateList: boolean;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  editing: CategoryEditing;
  onAdd: () => void;
  onToggleCategory: (checked: boolean) => void;
  pendingToggle: boolean | null;
  onSortAlpha: () => void;
  onDeleteItems: () => void;
};

const CategoryHeader = ({
  section,
  imageUrl,
  isTemplateList,
  onToggleCategory,
  onRenameCategory,
  onAdd,
  editing,
  pendingToggle,
  onSortAlpha,
  onDeleteItems,
}: CategoryHeaderProps) => {
  const allChecked = section.items.every((item) => item.checked);
  const indeterminate = !allChecked && section.items.some((item) => item.checked);
  const displayChecked = pendingToggle ?? allChecked;

  const openMenu = () =>
    showActionSheet(section.category.name, [
      { text: HOME_COPY.categoryMenuAddItem, onPress: onAdd },
      { text: HOME_COPY.categoryMenuSortAlpha, onPress: onSortAlpha },
      {
        text: HOME_COPY.categoryMenuDeleteItems,
        style: "destructive",
        onPress: onDeleteItems,
      },
    ]);

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
        {indeterminate && pendingToggle === null && (
          <View pointerEvents="none" style={homeStyles.categoryCheckboxIndicator} />
        )}
      </View>
      {imageUrl && <RNImage source={{ uri: imageUrl }} style={homeStyles.categoryImage} />}
      <EditableText
        value={section.category.name}
        onSubmit={(name) => onRenameCategory(section.category, name)}
        textStyle={homeStyles.categoryTitle}
        inputStyle={homeStyles.categoryInput}
        containerStyle={homeStyles.editable}
        onStart={() => editing.start(section.category.id)}
        onEnd={() => editing.stop(section.category.id)}
      />
      <Pressable
        style={homeStyles.addButton}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="Category menu"
      >
        <MaterialCommunityIcons name="dots-vertical" size={20} color={homeColors.muted} />
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
  const {
    section,
    lists,
    currentListId,
    search,
    drag,
    onToggle,
    onRenameItem,
    onDeleteItem,
    memberImages,
    initialsMap,
    onToggleMemberPacked,
    onToggleAllMembers,
    editing,
    onOpenAssignMembers,
    onOpenMoveCategory,
    onOpenCopyToList,
    onDrop,
    checkboxDisabled,
  } = props;
  const items = section.items;
  const hasOtherLists = lists.filter((l) => l.id !== currentListId).length > 0;
  const { indicatorTargetId, indicatorBelow } = computeIndicator(items, drag, section.category.id);
  const showToast = useToast();
  const onDuplicateName = () => showToast(COPY.duplicateItemName);
  return (
    <View
      style={[homeStyles.categoryBody, { position: "relative" }]}
      onLayout={(e) => drag.recordBodyLayout(section.category.id, e.nativeEvent.layout)}
    >
      {items.map((item) => (
        <CategoryItemRow
          key={item.id}
          item={item}
          initialsMap={initialsMap}
          memberNames={props.memberNames}
          memberImages={memberImages}
          editing={editing}
          hidden={drag.snapshot?.id === item.id}
          hasOtherLists={hasOtherLists}
          checkboxDisabled={checkboxDisabled}
          isCurrentMatch={search.currentMatchId === item.id}
          highlightOpacity={props.highlightId === item.id ? props.highlightOpacity : undefined}
          validateItemName={(name) => !hasDuplicateName(name, item.category, items, item.id)}
          onDuplicateName={onDuplicateName}
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
      <GhostRow items={items} drag={drag.snapshot} layouts={drag.layouts} animatedOffsetY={drag.animatedOffsetY} />
    </View>
  );
};

const computeIndicator = (items: PackItem[], drag: ReturnType<typeof useDragState>, categoryId: string) => {
  const itemIds = items.map((i) => i.id);
  const dropIndex = computeDropIndex(
    itemIds,
    drag.snapshot,
    drag.layouts,
    drag.sectionLayouts,
    drag.bodyLayouts,
    categoryId
  );
  if (dropIndex === null) return { indicatorTargetId: null, indicatorBelow: false };
  if (dropIndex === items.length && items.length > 0) {
    return {
      indicatorTargetId: items[items.length - 1].id,
      indicatorBelow: true,
    };
  }
  return {
    indicatorTargetId: items[dropIndex]?.id ?? null,
    indicatorBelow: false,
  };
};

const areRowPropsEqual = (prev: CategoryItemRowProps, next: CategoryItemRowProps): boolean => {
  return (
    prev.item.id === next.item.id &&
    prev.item.checked === next.item.checked &&
    prev.item.name === next.item.name &&
    prev.item.members.length === next.item.members.length &&
    prev.item.members.every((m, i) => m.checked === next.item.members[i]?.checked) &&
    prev.hidden === next.hidden &&
    !!prev.highlightOpacity === !!next.highlightOpacity &&
    prev.hasOtherLists === next.hasOtherLists &&
    prev.checkboxDisabled === next.checkboxDisabled &&
    prev.isCurrentMatch === next.isCurrentMatch &&
    prev.editing.editingId === next.editing.editingId &&
    prev.initialsMap === next.initialsMap &&
    prev.memberNames === next.memberNames &&
    prev.memberImages === next.memberImages
  );
};

const CategoryItemRow = memo((props: CategoryItemRowProps) => {
  const dragHandlers = {
    onStart: props.onDragStart,
    onMove: props.onDragMove,
    onEnd: props.onDragEnd,
  };
  const { wrap, dragging } = useDraggableRow(dragHandlers, {
    applyTranslation: false,
  });
  const rowStyle = [
    homeStyles.itemContainer,
    props.hidden && { opacity: 0 },
    dragging && { opacity: 0.5 },
    props.isCurrentMatch && homeStyles.itemHighlight,
  ];
  const showHighlight = !!props.highlightOpacity;
  const hasMembers = props.item.members.length > 0;
  const openMenu = () =>
    showActionSheet(props.item.name, [
      { text: "Edit Members", onPress: props.onOpenAssignMembers },
      { text: "Change Category", onPress: props.onOpenMoveCategory },
      ...(props.hasOtherLists ? [{ text: "Copy to List", onPress: props.onOpenCopyToList }] : []),
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(props),
      },
    ]);
  return (
    <View onLayout={(e) => props.onLayout(e.nativeEvent.layout)}>
      <Pressable style={rowStyle}>
        {showHighlight && (
          <Animated.View
            pointerEvents="none"
            style={[homeStyles.itemHighlight, homeStyles.itemHighlightOverlay, { opacity: props.highlightOpacity }]}
          />
        )}
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
            validate={props.validateItemName}
            onValidationFail={props.onDuplicateName}
            textStyle={[homeStyles.detailLabel, props.item.checked && homeStyles.detailLabelChecked]}
            inputStyle={homeStyles.itemInput}
            autoFocus={props.editing.active(props.item.id)}
            onStart={() => props.editing.start(props.item.id)}
            onEnd={() => props.editing.stop(props.item.id)}
          />
          <MemberInitials
            item={props.item}
            initialsMap={props.initialsMap}
            memberNames={props.memberNames}
            memberImages={props.memberImages}
            onToggle={props.onToggleMemberPacked}
          />
        </View>
        <Pressable
          style={homeStyles.menuButton}
          onPress={openMenu}
          accessibilityRole="button"
          accessibilityLabel="Item menu"
        >
          <Text style={homeStyles.menuIcon}>⋮</Text>
        </Pressable>
      </Pressable>
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

type GhostRowProps = {
  items: PackItem[];
  drag: DragSnapshot;
  layouts: Record<string, LayoutRectangle>;
  animatedOffsetY: Animated.Value;
};

const GhostRow = ({ items, drag, layouts, animatedOffsetY }: GhostRowProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const item = items.find((i) => i.id === drag.id);
  if (!item) return null;
  const top = drag.frozenY != null ? drag.frozenY : layout.y;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        homeStyles.itemGhost,
        { top, height: layout.height },
        drag.frozenY == null && {
          transform: [{ translateY: animatedOffsetY }],
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 0,
          height: "100%",
        }}
      >
        <DragHandle />
        <View style={[homeStyles.checkbox, { borderColor: homeColors.border, borderWidth: 1, marginRight: 8 }]} />
        <Text style={[homeStyles.detailLabel, { flex: 1 }]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </Animated.View>
  );
};

type DropIndicatorProps = {
  targetId: string | null;
  layouts: Record<string, LayoutRectangle>;
  below: boolean;
};

const DropIndicator = ({ targetId, layouts, below }: DropIndicatorProps) => {
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[homeStyles.itemIndicator, { top }]} />;
};

const COPY = {
  duplicateItemName: "Item with this name already exists in category",
};

const DELETE_COPY = {
  body: 'Delete {count} items from "{name}"?',
  confirm: "Delete",
  cancel: "Cancel",
};

const deleteStyles = StyleSheet.create({
  body: { fontSize: 14, color: homeColors.muted, textAlign: "center" },
});
