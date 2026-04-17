import { memo, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  LayoutRectangle,
  Platform,
  Pressable,
  Image as RNImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getPackItemChecked } from "~/services/packItemState.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { AssignMembersModal } from "./AssignMembersModal.tsx";
import { CategoryRenameDialogs, getRenameCategoryError, getRenameItemError } from "./CategoryRenameDialogs.tsx";
import { CopyToListModal } from "./CopyToListModal.tsx";
import { computeDropIndex } from "./itemOrdering.ts";
import { SectionGroup } from "./itemsSectionHelpers.ts";
import { getItemCheckboxColor } from "./listColors.ts";
import { MemberInitials } from "./MemberInitials.tsx";
import { MoveCategoryModal } from "./MoveCategoryModal.tsx";
import { MultiCheckbox } from "./MultiCheckbox.tsx";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { showNativeRenameItemPrompt } from "./showNativeRenameItemPrompt.ts";
import { showNativeTextPrompt } from "./showNativeTextPrompt.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { CHECKBOX_SIZE, homeColors } from "./theme.ts";
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
  onMoveItemsToCategory: (items: PackItem[], categoryId: string) => Promise<void>;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
  onSortCategoryAlpha: (items: PackItem[]) => Promise<void>;
};

type CategoryItemRowProps = {
  item: PackItem;
  checkboxColor: string;
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  memberImages: Image[];
  hidden: boolean;
  highlightOpacity: Animated.Value | undefined;
  hasOtherLists: boolean;
  checkboxDisabled: boolean;
  isCurrentMatch: boolean;
  onToggle: (item: PackItem) => void;
  onDeleteItem: (id: string) => void;
  onLayout: (layout: LayoutRectangle) => void;
  onDragStart: () => void;
  onDragMove: (offset: DragOffset) => void;
  onDragEnd: () => void;
  onOpenAssignMembers: () => void;
  onOpenMoveCategory: () => void;
  onOpenCopyToList: () => void;
  onOpenRename: () => void;
  onToggleMemberPacked: (memberId: string) => void;
  onToggleAllMembers: (checked: boolean) => void;
};

const CategorySectionImpl = (props: CategorySectionProps) => {
  const [assignItem, setAssignItem] = useState<PackItem | null>(null);
  const [moveItem, setMoveItem] = useState<PackItem | null>(null);
  const [moveCategoryVisible, setMoveCategoryVisible] = useState(false);
  const [copyItem, setCopyItem] = useState<PackItem | null>(null);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renameItem, setRenameItem] = useState<PackItem | null>(null);
  const [renameItemText, setRenameItemText] = useState("");
  const [renameCategoryVisible, setRenameCategoryVisible] = useState(false);
  const [renameCategoryText, setRenameCategoryText] = useState("");
  const renameItemErrorText = getRenameItemError(renameItem, renameItemText, props.section.items);
  const renameCategoryErrorText = getRenameCategoryError(props.section.category, renameCategoryText, props.categories);

  const onAdd = () => props.onAddItem(props.section.category);
  const openRenameItem = (item: PackItem) => {
    if (showNativeRenameItemPrompt(item, props.section.items, (name) => props.onRenameItem(item, name))) return;
    setRenameItem(item);
    setRenameItemText(item.name);
  };
  const submitRenameItem = () => {
    if (renameItem && !renameItemErrorText) props.onRenameItem(renameItem, renameItemText.trim());
    setRenameItem(null);
  };
  const openRenameCategory = () => {
    if (
      showNativeTextPrompt({
        title: HOME_COPY.renameCategoryPrompt,
        confirmLabel: HOME_COPY.renameListConfirm,
        cancelLabel: HOME_COPY.cancel,
        value: props.section.category.name,
        getError: (text) => getRenameCategoryError(props.section.category, text, props.categories),
        onSubmit: (text) => {
          const trimmed = text.trim();
          if (!trimmed || trimmed === props.section.category.name) return;
          props.onRenameCategory(props.section.category, trimmed);
        },
      })
    ) {
      return;
    }
    setRenameCategoryVisible(true);
    setRenameCategoryText(props.section.category.name);
  };
  const submitRenameCategory = () => {
    if (!renameCategoryErrorText) props.onRenameCategory(props.section.category, renameCategoryText.trim());
    setRenameCategoryVisible(false);
  };
  const handleMoveCategory = (category: NamedEntity) => {
    if (moveItem) props.onMoveCategory(moveItem, category.id);
  };
  const handleCopyToList = async (list: PackingListSummary) => {
    if (!copyItem) return;
    try {
      await props.onCopyToList(copyItem, list.id);
    } catch (e) {
      if (e instanceof DuplicateNameError) {
        Alert.alert(HOME_COPY.duplicateCopyToListTitle, HOME_COPY.duplicateCopyToList.replace("{name}", copyItem.name));
        return;
      }
      throw e;
    }
  };
  const handleCategoryToggle = (checked: boolean) => {
    if (props.section.items.length > 30) setPendingToggle(checked);
    setTimeout(() => props.onToggleCategory(props.section.items, checked), 0);
  };

  const allChecked = props.section.items.every(getPackItemChecked);
  useEffect(() => {
    if (pendingToggle !== null && pendingToggle === allChecked) {
      setPendingToggle(null);
    }
  }, [allChecked, pendingToggle]);

  useEffect(() => {
    if (!confirmDelete || Platform.OS !== "ios") return;
    Alert.alert(
      HOME_COPY.categoryMenuDeleteItems,
      DELETE_COPY.body.replace("{count}", String(props.section.items.length)).replace("{name}", props.section.title),
      [
        {
          text: DELETE_COPY.cancel,
          style: "cancel",
          onPress: () => setConfirmDelete(false),
        },
        {
          text: DELETE_COPY.confirm,
          style: "destructive",
          onPress: () => {
            setConfirmDelete(false);
            for (const item of props.section.items) props.onDeleteItem(item.id);
          },
        },
      ]
    );
  }, [confirmDelete, props.section.items, props.section.title, props.onDeleteItem]);

  const handleMoveSection = async (category: NamedEntity) => {
    await props.onMoveItemsToCategory(props.section.items, category.id);
  };

  const categoryImageUrl = props.categoryImages.find((img) => img.typeId === props.section.category.id)?.url;
  const checkboxColor = getItemCheckboxColor(props.color);

  return (
    <View
      style={[homeStyles.category, { backgroundColor: props.color }]}
      onLayout={(e) => props.drag.recordSectionLayout(props.section.category.id, e.nativeEvent.layout)}
    >
      <CategoryHeader
        section={props.section}
        imageUrl={categoryImageUrl}
        checkboxColor={checkboxColor}
        isTemplateList={props.isTemplateList}
        onAdd={onAdd}
        onToggleCategory={handleCategoryToggle}
        pendingToggle={pendingToggle}
        onSortAlpha={() => props.onSortCategoryAlpha(props.section.items)}
        onMoveCategory={() => setMoveCategoryVisible(true)}
        onDeleteItems={() => setConfirmDelete(true)}
        onRename={openRenameCategory}
      />
      <CategoryItems
        {...props}
        checkboxColor={checkboxColor}
        onOpenAssignMembers={setAssignItem}
        onOpenMoveCategory={setMoveItem}
        onOpenCopyToList={setCopyItem}
        onOpenRenameItem={openRenameItem}
        checkboxDisabled={props.isTemplateList}
      />
      {pendingToggle !== null && <View style={homeStyles.categoryOverlay} pointerEvents="box-only" />}
      <AssignMembersModal
        visible={!!assignItem}
        item={assignItem}
        members={props.members}
        memberImages={props.memberImages}
        onClose={() => setAssignItem(null)}
        onSave={props.onAssignMembers}
      />
      <MoveCategoryModal
        visible={!!moveItem}
        itemName={moveItem?.name ?? ""}
        categories={props.categories}
        categoryImages={props.categoryImages}
        currentCategoryId={moveItem?.category ?? ""}
        onClose={() => setMoveItem(null)}
        onSelect={handleMoveCategory}
      />
      <MoveCategoryModal
        visible={moveCategoryVisible}
        itemName={props.section.title}
        categories={props.categories}
        categoryImages={props.categoryImages}
        currentCategoryId={props.section.category.id}
        onClose={() => setMoveCategoryVisible(false)}
        onSelect={handleMoveSection}
      />
      <CopyToListModal
        visible={!!copyItem}
        lists={props.lists}
        currentListId={props.currentListId}
        onClose={() => setCopyItem(null)}
        onSelect={handleCopyToList}
      />
      {Platform.OS !== "ios" && (
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
              .replace("{name}", props.section.title)}
          </Text>
        </DialogShell>
      )}
      <CategoryRenameDialogs
        renameItem={renameItem}
        renameItemText={renameItemText}
        sectionItems={props.section.items}
        renameCategoryVisible={renameCategoryVisible}
        renameCategoryText={renameCategoryText}
        category={props.section.category}
        categories={props.categories}
        onChangeItemText={setRenameItemText}
        onCancelItem={() => setRenameItem(null)}
        onSubmitItem={submitRenameItem}
        onChangeCategoryText={setRenameCategoryText}
        onCancelCategory={() => setRenameCategoryVisible(false)}
        onSubmitCategory={submitRenameCategory}
      />
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

type CategoryHeaderProps = {
  section: SectionGroup;
  checkboxColor: string;
  imageUrl: string | undefined;
  isTemplateList: boolean;
  onAdd: () => void;
  onToggleCategory: (checked: boolean) => void;
  pendingToggle: boolean | null;
  onSortAlpha: () => void;
  onMoveCategory: () => void;
  onDeleteItems: () => void;
  onRename: () => void;
};

const CategoryHeader = ({
  section,
  checkboxColor,
  imageUrl,
  isTemplateList,
  onToggleCategory,
  onAdd,
  pendingToggle,
  onSortAlpha,
  onMoveCategory,
  onDeleteItems,
  onRename,
}: CategoryHeaderProps) => {
  const allChecked = section.items.every(getPackItemChecked);
  const indeterminate = !allChecked && section.items.some(getPackItemChecked);
  const displayChecked = pendingToggle ?? allChecked;

  const isUncategorized = section.category.id === "";

  const openMenu = () =>
    showActionSheet(section.title, [
      ...(isUncategorized ? [] : [{ text: HOME_COPY.rename, onPress: onRename }]),
      { text: HOME_COPY.categoryMenuAddItem, onPress: onAdd },
      { text: CATEGORY_COPY.changeCategory, onPress: onMoveCategory },
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
        <AppCheckbox
          checked={displayChecked}
          onToggle={() => onToggleCategory(!displayChecked)}
          disabled={isTemplateList || pendingToggle !== null}
          size={CHECKBOX_SIZE}
          checkedColor={checkboxColor}
        />
        {indeterminate && pendingToggle === null && (
          <View pointerEvents="none" style={homeStyles.categoryCheckboxIndicator} />
        )}
      </View>
      {imageUrl && <RNImage source={{ uri: imageUrl }} style={homeStyles.categoryImage} />}
      <Pressable onPress={isUncategorized ? undefined : onRename}>
        <Text style={homeStyles.categoryTitle} numberOfLines={1}>
          {section.title}
        </Text>
      </Pressable>
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
  checkboxColor: string;
  onOpenAssignMembers: (item: PackItem) => void;
  onOpenMoveCategory: (item: PackItem) => void;
  onOpenCopyToList: (item: PackItem) => void;
  onOpenRenameItem: (item: PackItem) => void;
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
    onDeleteItem,
    memberImages,
    initialsMap,
    onToggleMemberPacked,
    onToggleAllMembers,
    onOpenAssignMembers,
    onOpenMoveCategory,
    onOpenCopyToList,
    onOpenRenameItem,
    onDrop,
    checkboxDisabled,
  } = props;
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
          checkboxColor={props.checkboxColor}
          initialsMap={initialsMap}
          memberNames={props.memberNames}
          memberImages={memberImages}
          hidden={drag.snapshot?.id === item.id}
          hasOtherLists={hasOtherLists}
          checkboxDisabled={checkboxDisabled}
          isCurrentMatch={search.currentMatchId === item.id}
          highlightOpacity={props.highlightId === item.id ? props.highlightOpacity : undefined}
          onLayout={(layout) => drag.recordLayout(item.id, layout)}
          onDragStart={() => drag.start(item.id, item.category)}
          onDragMove={(offset) => drag.move(item.id, offset)}
          onDragEnd={() => drag.end((s) => s && onDrop(s, drag.layouts, drag.sectionLayouts, drag.bodyLayouts))}
          onToggle={onToggle}
          onDeleteItem={onDeleteItem}
          onOpenAssignMembers={() => onOpenAssignMembers(item)}
          onOpenMoveCategory={() => onOpenMoveCategory(item)}
          onOpenCopyToList={() => onOpenCopyToList(item)}
          onOpenRename={() => onOpenRenameItem(item)}
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
    prev.checkboxColor === next.checkboxColor &&
    prev.item.members.length === next.item.members.length &&
    prev.item.members.every((m, i) => m.checked === next.item.members[i]?.checked) &&
    prev.hidden === next.hidden &&
    !!prev.highlightOpacity === !!next.highlightOpacity &&
    prev.hasOtherLists === next.hasOtherLists &&
    prev.checkboxDisabled === next.checkboxDisabled &&
    prev.isCurrentMatch === next.isCurrentMatch &&
    prev.initialsMap === next.initialsMap &&
    prev.memberNames === next.memberNames &&
    prev.memberImages === next.memberImages
  );
};

const CategoryItemRow = memo((props: CategoryItemRowProps) => {
  const { profile } = useSpace();
  const wrapItemText = profile?.wrapItemText ?? false;
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
  const checked = getPackItemChecked(props.item);
  const showHighlight = !!props.highlightOpacity;
  const hasMembers = props.item.members.length > 0;
  const openMenu = () =>
    showActionSheet(props.item.name, [
      { text: HOME_COPY.rename, onPress: props.onOpenRename },
      { text: "Edit Members", onPress: props.onOpenAssignMembers },
      { text: "Change Category", onPress: props.onOpenMoveCategory },
      ...(props.hasOtherLists ? [{ text: "Copy to List", onPress: props.onOpenCopyToList }] : []),
      {
        text: "Delete",
        style: "destructive",
        onPress: () => props.onDeleteItem(props.item.id),
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
          <MultiCheckbox
            item={props.item}
            disabled={props.checkboxDisabled}
            onToggle={props.onToggleAllMembers}
            checkedColor={props.checkboxColor}
            size={CHECKBOX_SIZE}
          />
        ) : (
          <AppCheckbox
            checked={checked}
            onToggle={() => props.onToggle(props.item)}
            disabled={props.checkboxDisabled}
            size={CHECKBOX_SIZE}
            checkedColor={props.checkboxColor}
          />
        )}
        <View style={homeStyles.itemContent}>
          <View>
            <Pressable onPress={props.onOpenRename}>
              <Text
                style={[homeStyles.detailLabel, checked && homeStyles.detailLabelChecked]}
                numberOfLines={wrapItemText ? undefined : 1}
              >
                {props.item.name}
              </Text>
            </Pressable>
          </View>
          <MemberInitials
            item={props.item}
            initialsMap={props.initialsMap}
            memberNames={props.memberNames}
            memberImages={props.memberImages}
            checkedColor={props.checkboxColor}
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

const DELETE_COPY = {
  body: 'Delete {count} items from "{name}"?',
  confirm: "Delete",
  cancel: "Cancel",
};

const CATEGORY_COPY = { changeCategory: "Change Category" };

const deleteStyles = StyleSheet.create({
  body: { fontSize: 14, color: homeColors.muted, textAlign: "center" },
});
