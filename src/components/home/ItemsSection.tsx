import { useCallback, useEffect, useMemo, useState } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY } from "./styles.ts";
import { writeDb } from "~/services/database.ts";
import { getNextItemRank, getNextCategoryRank } from "./itemsSectionHelpers.ts";
import { animateLayout } from "./layoutAnimation.ts";
import { ItemsPanel, type ListHandlers, type TextDialogState, type AddItemDialogState } from "./ItemsPanel.tsx";
import { FilterSheet } from "./FilterSheet.tsx";
import { applyFilters } from "./filterUtils.ts";
import { useFilterDialog } from "./useFilterDialog.ts";
import { useItemToggle, useItemRename, useItemDelete, useCategoryRename, useCategoryToggle, useAssignMembers, useToggleMemberPacked, useToggleAllMembers, useListRenamer } from "./itemHandlers.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";

const getCategoriesInList = (categories: NamedEntity[], items: PackItem[]) => {
  const categoryIds = new Set(items.map((i) => i.category));
  const result = categories.filter((c) => categoryIds.has(c.id));
  if (categoryIds.has("")) result.push(UNCATEGORIZED);
  return result.sort((a, b) => b.rank - a.rank);
};

const useItemAdder = (items: PackItem[], packingListId?: string | null) => useCallback(async (category: NamedEntity) => {
  if (!packingListId) throw new Error("Missing packing list");
  animateLayout();
  return await writeDb.addPackItem(HOME_COPY.newItem, [], category.id, packingListId, getNextItemRank(items));
}, [items, packingListId]);

export const ItemsSection = (props: ItemsSectionProps) => {
  const list = props.selection.selectedList;
  const categoriesInList = useMemo(() => getCategoriesInList(props.categoriesState.categories, props.itemsState.items), [props.categoriesState.categories, props.itemsState.items]);
  const filterDialog = useFilterDialog(categoriesInList, props.membersState.members, props.itemsState.items);
  const filteredItems = useMemo(() => applyFilters(props.itemsState.items, filterDialog.selectedCategories, filterDialog.selectedMembers, filterDialog.statusFilter), [props.itemsState.items, filterDialog.selectedCategories, filterDialog.selectedMembers, filterDialog.statusFilter]);
  const filteredItemsState = { ...props.itemsState, items: filteredItems, hasItems: filteredItems.length > 0 };
  const filteredProps = { ...props, itemsState: filteredItemsState };
  const handlers = useItemsSectionHandlers(filteredProps);
  const renameList = useListRenamer();
  const addItemDialog = useAddItemDialog(props.itemsState.items, props.categoriesState.categories, list?.id);
  const renameDialog = useRenameDialog(list, renameList);
  if (!list) return null;
  const displayName = list.name?.trim() ? list.name : HOME_COPY.detailHeader;
  return (
    <>
      <ItemsPanel {...filteredProps} {...handlers} list={list} displayName={displayName} renameDialog={renameDialog} addItemDialog={addItemDialog} filterDialog={filterDialog} />
      <FilterSheet visible={filterDialog.visible} categories={filterDialog.categories} selectedCategories={filterDialog.selectedCategories} onToggleCategory={filterDialog.onToggleCategory} members={filterDialog.members} selectedMembers={filterDialog.selectedMembers} onToggleMember={filterDialog.onToggleMember} statusFilter={filterDialog.statusFilter} onSetStatus={filterDialog.onSetStatus} onClear={filterDialog.onClear} onClose={filterDialog.close} />
    </>
  );
};

const useItemsSectionHandlers = (props: ItemsSectionProps): ListHandlers => ({
  onToggle: useItemToggle(),
  onRenameItem: useItemRename(),
  onDeleteItem: useItemDelete(),
  onAddItem: useItemAdder(props.itemsState.items, props.selection.selectedList?.id),
  onRenameCategory: useCategoryRename(),
  onToggleCategory: useCategoryToggle(),
  onAssignMembers: useAssignMembers(),
  onToggleMemberPacked: useToggleMemberPacked(),
  onToggleAllMembers: useToggleAllMembers(),
});

const useRenameDialog = (list: NamedEntity | null, rename: (target: NamedEntity, name: string) => void): TextDialogState => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(list?.name ?? "");
  useEffect(() => setValue(list?.name ?? ""), [list?.id, list?.name]);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!list || !trimmed || trimmed === list.name) { close(); return; }
    rename(list, trimmed);
    close();
  }, [value, list, rename, close]);
  return { visible, value, setValue, open, close, submit };
};

const useAddItemDialog = (items: PackItem[], categories: NamedEntity[], listId?: string | null): AddItemDialogState => {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(async (itemName: string, category: NamedEntity | null, newCategoryName: string | null) => {
    if (!listId) return close();
    animateLayout();
    let categoryId = category?.id ?? UNCATEGORIZED.id;
    if (newCategoryName) {
      const newCategory = await writeDb.addCategory(newCategoryName, getNextCategoryRank(categories));
      categoryId = newCategory.id;
    }
    void writeDb.addPackItem(itemName, [], categoryId, listId, getNextItemRank(items));
    close();
  }, [items, categories, listId, close]);
  return { visible, open, close, submit };
};
