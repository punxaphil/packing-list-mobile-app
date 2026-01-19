import { useCallback, useRef, useEffect, useState } from "react";
import { Animated } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY } from "./styles.ts";
import { writeDb } from "~/services/database.ts";
import { getNextItemRank, getNextCategoryRank } from "./itemsSectionHelpers.ts";
import { animateLayout } from "./layoutAnimation.ts";
import { ItemsPanel, type ListHandlers, type TextDialogState, type AddItemDialogState } from "./ItemsPanel.tsx";
import { UNCATEGORIZED } from "~/services/utils.ts";
const FADE_DURATION = 1000;

const useItemToggle = () => useCallback((item: PackItem) => { animateLayout(); void writeDb.updatePackItem({ ...item, checked: !item.checked }); }, []);
const useItemRename = () => useCallback((item: PackItem, name: string) => { const trimmed = name.trim(); if (!trimmed || trimmed === item.name) return; void writeDb.updatePackItem({ ...item, name: trimmed }); }, []);
const useItemDelete = () => useCallback((id: string) => { animateLayout(); void writeDb.deletePackItem(id); }, []);
const useItemAdder = (items: PackItem[], packingListId?: string | null) => useCallback(async (category: NamedEntity) => {
  if (!packingListId) throw new Error("Missing packing list");
  animateLayout();
  return await writeDb.addPackItem(HOME_COPY.newItem, [], category.id, packingListId, getNextItemRank(items));
}, [items, packingListId]);
const useCategoryRename = () => useCallback((category: NamedEntity, name: string) => { const trimmed = name.trim(); if (!trimmed || trimmed === category.name) return; void writeDb.updateCategories({ ...category, name: trimmed }); }, []);
const useCategoryToggle = () => useCallback((items: PackItem[], checked: boolean) => { animateLayout(); const updates = items.map((item) => writeDb.updatePackItem({ ...item, checked })); void Promise.all(updates); }, []);

export const ItemsSection = (props: ItemsSectionProps) => {
  const handlers = useItemsSectionHandlers(props);
  const fade = useSelectionFade(props.selection.selectedId);
  const list = props.selection.selectedList;
  const renameList = useListRenamer();
  const addItemDialog = useAddItemDialog(props.itemsState.items, props.categoriesState.categories, props.selection.selectedList?.id);
  if (!list) return null;
  const displayName = list.name?.trim() ? list.name : HOME_COPY.detailHeader;
  const renameDialog = useRenameDialog(list, renameList);
  return <ItemsPanel {...props} {...handlers} list={list} displayName={displayName} renameDialog={renameDialog} addItemDialog={addItemDialog} fade={fade} />;
};

const useItemsSectionHandlers = (props: ItemsSectionProps): ListHandlers => ({
  onToggle: useItemToggle(),
  onRenameItem: useItemRename(),
  onDeleteItem: useItemDelete(),
  onAddItem: useItemAdder(props.itemsState.items, props.selection.selectedList?.id),
  onRenameCategory: useCategoryRename(),
  onToggleCategory: useCategoryToggle(),
});

const useSelectionFade = (selectedId: string) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }).start();
  }, [selectedId, opacity]);
  return { opacity } as const;
};

const useListRenamer = () =>
  useCallback((list: NamedEntity, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === list.name) return;
    void writeDb.updatePackingList({ ...list, name: trimmed });
  }, []);

const useRenameDialog = (list: NamedEntity, rename: (target: NamedEntity, name: string) => void): TextDialogState => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(list.name ?? "");
  useEffect(() => setValue(list.name ?? ""), [list.id, list.name]);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === list.name) {
      close();
      return;
    }
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
