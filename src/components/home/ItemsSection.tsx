import { useCallback, useEffect, useMemo, useState } from "react";
import { PackingKit } from "~/data/packingKits.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { type WriteDb } from "~/services/database.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { Image } from "~/types/Image.ts";
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
  if (categoryIds.has("") && result.length > 0) result.push(UNCATEGORIZED);
  return result.sort((a, b) => b.rank - a.rank);
};

const buildImageMap = (images: Image[], type: string) =>
  new Map(images.filter((image) => image.type === type).map((image) => [image.typeId, image.url]));

const attachImagesToEntities = (entities: NamedEntity[], imageMap: Map<string, string>) =>
  entities.map((entity) => ({ ...entity, image: imageMap.get(entity.id) }));

export const ItemsSection = (props: ItemsSectionProps) => {
  const { writeDb } = useSpace();
  const list = props.selection.selectedList;
  const { optimisticItems, toggleCategory, toggleItem } = useOptimisticItems(props.itemsState.items);
  const categoryImageMap = useMemo(
    () => buildImageMap(props.imagesState.images, "categories"),
    [props.imagesState.images]
  );
  const memberImageMap = useMemo(() => buildImageMap(props.imagesState.images, "members"), [props.imagesState.images]);
  const categoriesInList = useMemo(
    () =>
      attachImagesToEntities(getCategoriesInList(props.categoriesState.categories, optimisticItems), categoryImageMap),
    [props.categoriesState.categories, optimisticItems, categoryImageMap]
  );
  const membersWithImages = useMemo(
    () => attachImagesToEntities(props.membersState.members, memberImageMap),
    [props.membersState.members, memberImageMap]
  );
  const filterDialog = useFilterDialog(categoriesInList, membersWithImages, optimisticItems, list?.id);
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
  const filteredItemsState = {
    ...props.itemsState,
    items: filteredItems,
    hasItems: optimisticItems.length > 0,
    filteredEmpty: optimisticItems.length > 0 && filteredItems.length === 0,
  };
  const filteredProps = { ...props, itemsState: filteredItemsState };
  const search = useSearch(filteredItems, categoriesInList);
  const handlers = useItemsSectionHandlers(toggleItem, toggleCategory);
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

const useItemsSectionHandlers = (toggleItem: ToggleItem, toggleCategory: ToggleCategory): ListHandlers => ({
  onToggle: useCallback(
    (item: PackItem) => {
      void toggleItem(item);
    },
    [toggleItem]
  ),
  onRenameItem: useItemRename(),
  onDeleteItem: useItemDelete(),
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
});

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
  const getError = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      const isDuplicate = list && trimmed && trimmed !== list.name && hasDuplicateEntityName(trimmed, lists, list.id);
      return isDuplicate ? HOME_COPY.duplicateListName : null;
    },
    [list, lists]
  );
  const onChange = useCallback(
    (text: string) => {
      setValue(text);
      setError(getError(text));
    },
    [getError]
  );
  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      const nextError = getError(text);
      if (!list || !trimmed || trimmed === list.name || nextError) {
        setError(nextError);
        if (!nextError) close();
        return;
      }
      rename(list, trimmed);
      close();
    },
    [close, getError, list, rename]
  );
  const submit = useCallback(() => {
    submitText(value);
  }, [submitText, value]);
  return {
    visible,
    value,
    error,
    getError,
    setValue: onChange,
    open,
    close,
    submitText,
    submit,
  };
};

const useAddItemDialog = (
  items: PackItem[],
  categories: NamedEntity[],
  writeDb: WriteDb,
  listId?: string | null
): AddItemDialogState => {
  const [visible, setVisible] = useState(false);
  const [kitPickerVisible, setKitPickerVisible] = useState(false);
  const [initialCategory, setInitialCategory] = useState<NamedEntity | undefined>();
  const open = useCallback((category?: NamedEntity) => {
    setInitialCategory(category);
    setVisible(true);
  }, []);
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
  return {
    visible,
    initialCategory,
    open,
    close,
    submit,
    onBrowseKits,
    kitPickerVisible,
    closeKitPicker,
    addKits,
  };
};
