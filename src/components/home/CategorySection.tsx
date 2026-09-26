import i18next from "i18next";
import { memo, useCallback, useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getPackItemChecked } from "~/services/packItemState.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import type { useFlashHighlight } from "../shared/useFlashHighlight.ts";
import { AssignMembersModal } from "./AssignMembersModal.tsx";
import { CategoryHeader } from "./CategoryHeader.tsx";
import { CategoryItemRow } from "./CategoryItemRow.tsx";
import { CategoryRenameDialogs, getRenameCategoryError, getRenameItemError } from "./CategoryRenameDialogs.tsx";
import { CopyToListModal } from "./CopyToListModal.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import { DropIndicator, GhostRow } from "./ItemOrderingOverlay.tsx";
import { computeDropIndex } from "./itemOrdering.ts";
import type { RowLayout } from "./itemRowProps.ts";
import { getNextCategoryRank, SectionGroup } from "./itemsSectionHelpers.ts";
import { getItemCheckboxColor } from "./listColors.ts";
import { MoveCategoryModal } from "./MoveCategoryModal.tsx";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { HOME_COPY } from "./styles.ts";
import { useToast } from "./Toast.tsx";
import { homeColors, homeRadius, homeSpacing } from "./theme.ts";
import { PackingListSummary } from "./types.ts";
import { DragSnapshot, useDragState } from "./useDragState.ts";
import { useMeasuredItemRow } from "./useMeasuredItemRow.ts";
import type { SearchState } from "./useSearch.ts";

type CategorySectionProps = {
  section: SectionGroup;
  columnCount: number;
  allItems: PackItem[];
  color: string;
  members: NamedEntity[];
  memberImages: Image[];
  categoryImages: Image[];
  itemImages: Image[];
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  categories: NamedEntity[];
  lists: NamedEntity[];
  currentListId: string;
  isTemplateList: boolean;
  search: SearchState;
  drag: ReturnType<typeof useDragState>;
  layouts: Record<string, RowLayout>;
  highlightId: string | null;
  highlightOpacity: ReturnType<typeof useFlashHighlight>["highlightOpacity"];
  onDrop: (
    snapshot: DragSnapshot,
    layouts: Record<string, RowLayout>,
    sectionLayouts: Record<string, RowLayout>,
    bodyLayouts: Record<string, RowLayout>
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
  onItemImagePress: (item: PackItem) => void;
};

const CategorySectionImpl = (props: CategorySectionProps) => {
  const { writeDb } = useSpace();
  const { show: showToast } = useToast();
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
  const renameItemErrorText = getRenameItemError(renameItem, renameItemText, props.allItems);
  const renameCategoryErrorText = getRenameCategoryError(props.section.category, renameCategoryText, props.categories);

  const onAdd = () => props.onAddItem(props.section.category);
  const openRenameItem = (item: PackItem) => {
    setRenameItem(item);
    setRenameItemText(item.name);
  };
  const submitRenameItem = () => {
    if (renameItem && renameItemText.trim() && !renameItemErrorText)
      props.onRenameItem(renameItem, renameItemText.trim());
    setRenameItem(null);
  };
  const openRenameCategory = () => {
    setRenameCategoryVisible(true);
    setRenameCategoryText(props.section.category.name);
  };
  const submitRenameCategory = () => {
    if (renameCategoryText.trim() && !renameCategoryErrorText)
      props.onRenameCategory(props.section.category, renameCategoryText.trim());
    setRenameCategoryVisible(false);
  };
  const resolveMoveCategory = async (category: NamedEntity | null, newCategoryName: string | null) => {
    const trimmedName = newCategoryName?.trim();
    if (!trimmedName) return category ?? props.section.category;
    const existing = props.categories.find((entry) => entry.name.toLowerCase() === trimmedName.toLowerCase());
    return existing ?? writeDb.addCategory(trimmedName, getNextCategoryRank(props.categories));
  };
  const handleMoveCategory = async (category: NamedEntity | null, newCategoryName: string | null) => {
    if (!moveItem) return;
    const nextCategory = await resolveMoveCategory(category, newCategoryName);
    props.onMoveCategory(moveItem, nextCategory.id);
  };
  const handleCopyToList = async (list: PackingListSummary) => {
    if (!copyItem) return;
    try {
      await props.onCopyToList(copyItem, list.id);
      showToast(i18next.t("copyToList.copied", { item: copyItem.name, list: list.name }));
    } catch (e) {
      if (e instanceof DuplicateNameError) {
        showToast(HOME_COPY.duplicateCopyToList.replace("{name}", copyItem.name));
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

  const handleMoveSection = async (category: NamedEntity | null, newCategoryName: string | null) => {
    const nextCategory = await resolveMoveCategory(category, newCategoryName);
    await props.onMoveItemsToCategory(props.section.items, nextCategory.id);
  };

  const categoryImageUrl = props.categoryImages.find((img) => img.typeId === props.section.category.id)?.url;
  const checkboxColor = getItemCheckboxColor(props.color);
  const recordSectionLayout = useCallback(
    (layout: RowLayout) => props.drag.recordSectionLayout(props.section.category.id, layout),
    [props.drag.recordSectionLayout, props.section.category.id]
  );
  const sectionRef = useMeasuredItemRow(recordSectionLayout);

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: homeSpacing.xs,
        padding: homeSpacing.sm,
        border: `1px solid ${homeColors.border}`,
        borderRadius: homeRadius,
        backgroundColor: props.color,
      }}
    >
      <CategoryHeader
        section={props.section}
        color={props.color}
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
      {pendingToggle !== null && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: homeColors.categoryPending }} />
      )}
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
        categories={props.categories}
        categoryImages={props.categoryImages}
        currentCategoryId={moveItem?.category ?? ""}
        onClose={() => setMoveItem(null)}
        onSubmit={handleMoveCategory}
      />
      <MoveCategoryModal
        visible={moveCategoryVisible}
        categories={props.categories}
        categoryImages={props.categoryImages}
        currentCategoryId={props.section.category.id}
        onClose={() => setMoveCategoryVisible(false)}
        onSubmit={handleMoveSection}
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
            cancelLabel={commonCopy.cancel}
            confirmLabel={homeCopy.deleteListAction}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              setConfirmDelete(false);
              for (const item of props.section.items) props.onDeleteItem(item.id);
            }}
          />
        }
      >
        <p style={{ fontSize: 14, color: homeColors.muted, textAlign: "center" }}>
          {i18next.t("category.deleteItemsBody", {
            count: props.section.items.length,
            name: props.section.title,
          })}
        </p>
      </DialogShell>
      <CategoryRenameDialogs
        renameItem={renameItem}
        renameItemText={renameItemText}
        allItems={props.allItems}
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
    </div>
  );
};

const areSectionPropsEqual = (prev: CategorySectionProps, next: CategorySectionProps): boolean => {
  if (prev.columnCount !== next.columnCount) return false;
  if (prev.allItems !== next.allItems) return false;
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
  if (prev.itemImages !== next.itemImages) return false;
  return true;
};

export const CategorySection = memo(CategorySectionImpl, areSectionPropsEqual);

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
    columnCount,
    lists,
    currentListId,
    search,
    drag,
    onToggle,
    onDeleteItem,
    memberImages,
    itemImages,
    initialsMap,
    onToggleMemberPacked,
    onToggleAllMembers,
    onOpenAssignMembers,
    onOpenMoveCategory,
    onOpenCopyToList,
    onOpenRenameItem,
    onItemImagePress,
    onDrop,
    checkboxDisabled,
  } = props;
  const items = section.items;
  const hasOtherLists = lists.some((list) => list.id !== currentListId && !list.archived);
  const { indicatorTargetId, indicatorBelow } = computeIndicator(items, drag, section.category.id, props.layouts);
  const recordBodyLayout = useCallback(
    (layout: RowLayout) => drag.recordBodyLayout(section.category.id, layout),
    [drag.recordBodyLayout, section.category.id]
  );
  const bodyRef = useMeasuredItemRow(recordBodyLayout);
  return (
    <div
      ref={bodyRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: columnCount > 1 ? "row" : "column",
        flexWrap: columnCount > 1 ? "wrap" : "nowrap",
        rowGap: homeSpacing.xs,
        columnGap: 0,
        padding: homeSpacing.xs,
        borderRadius: homeRadius / 2,
        backgroundColor: columnCount > 1 ? props.color : homeColors.categoryBody,
      }}
    >
      {items.map((item) => (
        <CategoryItemRow
          key={item.id}
          item={item}
          columnCount={columnCount}
          dragDisabled={columnCount > 1}
          color={props.color}
          checkboxColor={props.checkboxColor}
          initialsMap={initialsMap}
          memberNames={props.memberNames}
          memberImages={memberImages}
          itemImage={itemImages.find((img) => img.typeId === item.id)}
          hidden={drag.snapshot?.id === item.id}
          hasOtherLists={hasOtherLists}
          checkboxDisabled={checkboxDisabled}
          isCurrentMatch={search.currentMatchId === item.id}
          highlightOpacity={props.highlightId === item.id ? props.highlightOpacity : undefined}
          onLayout={(layout) => drag.recordLayout(item.id, layout)}
          onDragStart={() => drag.start(item.id, item.category)}
          onDragMove={(offset) => drag.move(item.id, offset)}
          onDragEnd={() => drag.end((s) => s && onDrop(s, props.layouts, drag.sectionLayouts, drag.bodyLayouts))}
          onToggle={onToggle}
          onDeleteItem={onDeleteItem}
          onOpenAssignMembers={() => onOpenAssignMembers(item)}
          onOpenMoveCategory={() => onOpenMoveCategory(item)}
          onOpenCopyToList={() => onOpenCopyToList(item)}
          onOpenRename={() => onOpenRenameItem(item)}
          onOpenImagePicker={() => onItemImagePress(item)}
          onToggleMemberPacked={(memberId) => onToggleMemberPacked(item, memberId)}
          onToggleAllMembers={(checked) => onToggleAllMembers(item, checked)}
        />
      ))}
      {columnCount === 1 && (
        <DropIndicator targetId={indicatorTargetId} layouts={props.layouts} below={indicatorBelow} />
      )}
      {columnCount === 1 && <GhostRow items={items} drag={drag.snapshot} layouts={props.layouts} />}
    </div>
  );
};

const computeIndicator = (
  items: PackItem[],
  drag: ReturnType<typeof useDragState>,
  categoryId: string,
  layouts: Record<string, RowLayout>
) => {
  const itemIds = items.map((i) => i.id);
  const dropIndex = computeDropIndex(
    itemIds,
    drag.snapshot,
    layouts,
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
