import { useCallback, useEffect, useMemo, useState } from "react";
import { PackingKit } from "~/data/packingKits.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { type WriteDb } from "~/services/database.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateEntityName } from "../shared/entityValidation.ts";
import { FilterSheet } from "./FilterSheet.tsx";
import { applyFilters } from "./filterUtils.ts";
import { type AddItemDialogState, ItemsPanel, type ListHandlers, type TextDialogState } from "./ItemsPanel.tsx";
import {
  useAssignMembers,
  useCategoryRename,
  useCopyToList,
  useItemDelete,
  useItemRename,
  useListRenamer,
  useMoveCategory,
  useSortCategoryAlpha,
  useToggleAllMembers,
  useToggleMemberPacked,
} from "./itemHandlers.ts";
import { getNextCategoryRank, getNextItemRank } from "./itemsSectionHelpers.ts";
import { KitPickerModal } from "./KitPickerModal.tsx";
import { animateLayout } from "./layoutAnimation.ts";
import { HOME_COPY } from "./styles.ts";
import { ItemsSectionProps } from "./types.ts";
import { useFilterDialog } from "./useFilterDialog.ts";
import { useOptimisticItems } from "./useOptimisticItems.ts";
import { useSearch } from "./useSearch.ts";

const getCategoriesInList = (categories: NamedEntity[], items: PackItem[]) => {
  const categoryIds = new Set(items.map((i) => i.category));
  const result = categories.filter((c) => categoryIds.has(c.id));
  if (categoryIds.has("")) result.push(UNCATEGORIZED);
  return result.sort((a, b) => b.rank - a.rank);
};

const getUniqueItemName = (baseName: string, categoryId: string, items: PackItem[]) => {
  const categoryItems = items.filter((i) => i.category === categoryId);
  const names = new Set(categoryItems.map((i) => i.name.toLowerCase()));
  if (!names.has(baseName.toLowerCase())) return baseName;
  let counter = 2;
  while (names.has(`${baseName.toLowerCase()} ${counter}`)) counter++;
  return `${baseName} ${counter}`;
};

const useItemAdder = (items: PackItem[], writeDb: WriteDb, packingListId?: string | null) =>
  useCallback(
    async (category: NamedEntity) => {
      if (!packingListId) throw new Error("Missing packing list");
      animateLayout();
      const name = getUniqueItemName(HOME_COPY.newItem, category.id, items);
      return await writeDb.addPackItem(name, [], category.id, packingListId, getNextItemRank(items));
    },
    [items, writeDb, packingListId]
  );

export const ItemsSection = (props: ItemsSectionProps) => {
  const { writeDb } = useSpace();
  const list = props.selection.selectedList;
  const { optimisticItems, toggleCategory, toggleItem } = useOptimisticItems(props.itemsState.items);
  const categoriesInList = useMemo(
    () => getCategoriesInList(props.categoriesState.categories, optimisticItems),
    [props.categoriesState.categories, optimisticItems]
  );
  const filterDialog = useFilterDialog(categoriesInList, props.membersState.members, optimisticItems, list?.id);
  const filteredItems = useMemo(
    () =>
      applyFilters(
        optimisticItems,
        filterDialog.selectedCategories,
        filterDialog.selectedMembers,
        filterDialog.statusFilter
      ),
    [optimisticItems, filterDialog.selectedCategories, filterDialog.selectedMembers, filterDialog.statusFilter]
  );
  const filteredItemsState = { ...props.itemsState, items: filteredItems, hasItems: filteredItems.length > 0 };
  const filteredProps = { ...props, itemsState: filteredItemsState };
  const search = useSearch(filteredItems, categoriesInList);
  const handlers = useItemsSectionHandlers(filteredProps, toggleItem, toggleCategory);
  const renameList = useListRenamer();
  const addItemDialog = useAddItemDialog(optimisticItems, props.categoriesState.categories, writeDb, list?.id);
  const renameDialog = useRenameDialog(list, props.lists, renameList);
  if (!list) return null;
  const displayName = list.name?.trim() ? list.name : HOME_COPY.detailHeader;
  return (
    <>
      <ItemsPanel
        {...filteredProps}
        {...handlers}
        list={list}
        displayName={displayName}
        renameDialog={renameDialog}
        addItemDialog={addItemDialog}
        filterDialog={filterDialog}
        search={search}
      />
      <FilterSheet
        visible={filterDialog.visible}
        categories={filterDialog.categories}
        selectedCategories={filterDialog.selectedCategories}
        onToggleCategory={filterDialog.onToggleCategory}
        members={filterDialog.members}
        selectedMembers={filterDialog.selectedMembers}
        onToggleMember={filterDialog.onToggleMember}
        statusFilter={filterDialog.statusFilter}
        onSetStatus={filterDialog.onSetStatus}
        onClear={filterDialog.onClear}
        onClose={filterDialog.close}
      />
      <KitPickerModal
        visible={addItemDialog.kitPickerVisible}
        onClose={addItemDialog.closeKitPicker}
        onAdd={addItemDialog.addKits}
      />
    </>
  );
};

type ToggleItem = (item: PackItem) => Promise<void>;
type ToggleCategory = (items: PackItem[], checked: boolean) => void;

const useItemsSectionHandlers = (
  props: ItemsSectionProps,
  toggleItem: ToggleItem,
  toggleCategory: ToggleCategory
): ListHandlers => {
  const { writeDb } = useSpace();
  return {
    onToggle: useCallback(
      (item: PackItem) => {
        void toggleItem(item);
      },
      [toggleItem]
    ),
    onRenameItem: useItemRename(),
    onDeleteItem: useItemDelete(),
    onAddItem: useItemAdder(props.itemsState.items, writeDb, props.selection.selectedList?.id),
    onRenameCategory: useCategoryRename(),
    onToggleCategory: useCallback(
      (items: PackItem[], checked: boolean) => {
        void toggleCategory(items, checked);
      },
      [toggleCategory]
    ),
    onAssignMembers: useAssignMembers(),
    onToggleMemberPacked: useToggleMemberPacked(),
    onToggleAllMembers: useToggleAllMembers(),
    onMoveCategory: useMoveCategory(),
    onCopyToList: useCopyToList(),
    onSortCategoryAlpha: useSortCategoryAlpha(),
  };
};

const useRenameDialog = (
  list: NamedEntity | null,
  lists: NamedEntity[],
  rename: (target: NamedEntity, name: string) => void
): TextDialogState => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(list?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setValue(list?.name ?? ""), [list?.name]);
  const open = useCallback(() => {
    setError(null);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);
  const onChange = useCallback(
    (text: string) => {
      setValue(text);
      const trimmed = text.trim();
      const isDuplicate = list && trimmed && trimmed !== list.name && hasDuplicateEntityName(trimmed, lists, list.id);
      setError(isDuplicate ? HOME_COPY.duplicateListName : null);
    },
    [list, lists]
  );
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!list || !trimmed || trimmed === list.name || error) {
      if (!error) close();
      return;
    }
    rename(list, trimmed);
    close();
  }, [value, list, error, rename, close]);
  return { visible, value, error, setValue: onChange, open, close, submit };
};

const useAddItemDialog = (
  items: PackItem[],
  categories: NamedEntity[],
  writeDb: WriteDb,
  listId?: string | null
): AddItemDialogState => {
  const [visible, setVisible] = useState(false);
  const [kitPickerVisible, setKitPickerVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const onBrowseKits = useCallback(() => {
    setVisible(false);
    setKitPickerVisible(true);
  }, []);
  const closeKitPicker = useCallback(() => setKitPickerVisible(false), []);
  const submit = useCallback(
    async (itemName: string, category: NamedEntity | null, newCategoryName: string | null) => {
      if (!listId) return close();
      animateLayout();
      let categoryId = category?.id ?? UNCATEGORIZED.id;
      if (newCategoryName) {
        const existing = categories.find((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
        categoryId = existing
          ? existing.id
          : (await writeDb.addCategory(newCategoryName, getNextCategoryRank(categories))).id;
      }
      void writeDb.addPackItem(itemName, [], categoryId, listId, getNextItemRank(items));
      close();
    },
    [items, categories, writeDb, listId, close]
  );
  const addKits = useCallback(
    async (kits: PackingKit[]) => {
      if (!listId) return;
      animateLayout();
      const categoryMap = new Map<string, string>();
      for (const cat of categories) {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      }
      let currentCategoryRank = getNextCategoryRank(categories);
      let currentItemRank = getNextItemRank(items);
      for (const kit of kits) {
        for (const kitItem of kit.items) {
          const catKey = kitItem.category.toLowerCase();
          let categoryId = categoryMap.get(catKey);
          if (!categoryId) {
            const newCat = await writeDb.addCategory(kitItem.category, currentCategoryRank++);
            categoryId = newCat.id;
            categoryMap.set(catKey, categoryId);
          }
          await writeDb.addPackItem(kitItem.name, [], categoryId, listId, currentItemRank++);
        }
      }
    },
    [items, categories, writeDb, listId]
  );
  return { visible, open, close, submit, onBrowseKits, kitPickerVisible, closeKitPicker, addKits };
};
