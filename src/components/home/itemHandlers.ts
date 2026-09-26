import { useCallback } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { WriteDb } from "~/services/database.ts";
import { withPackItemMembers } from "~/services/packItemState.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { animateLayout } from "./layoutAnimation.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { HOME_COPY } from "./styles.ts";

export const useItemRename = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === item.name) return;
      void writeDb.updatePackItem({ ...item, name: trimmed });
    },
    [writeDb]
  );
};

export const useItemDelete = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (items: PackItem[], categories: NamedEntity[], lists: NamedEntity[], id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      const deleteCategory = await shouldDeleteCategory(writeDb, items, categories, item);
      animateLayout();
      await writeDb.deletePackItem(id);
      if (deleteCategory) await writeDb.deleteCategory(item.category, lists);
    },
    [writeDb]
  );
};

const shouldDeleteCategory = async (writeDb: WriteDb, items: PackItem[], categories: NamedEntity[], item: PackItem) => {
  if (!item.category) return false;
  if (items.some((entry) => entry.category === item.category && entry.id !== item.id)) return false;
  const category = categories.find((entry) => entry.id === item.category);
  if (!category) return false;
  const packItems = await writeDb.getPackItemsForAllPackingLists();
  const usedInOtherLists = packItems.some((entry) => entry.category === item.category && entry.id !== item.id);
  if (usedInOtherLists) return false;
  return confirmDeleteCategory(category.name);
};

const confirmDeleteCategory = (name: string) =>
  new Promise<boolean>((resolve) =>
    showActionSheet(
      `${HOME_COPY.deleteCategoryQuestionTitle}\n${HOME_COPY.deleteCategoryQuestionMessage.replace("{name}", name)}`,
      [
        { text: HOME_COPY.deleteCategoryAction, style: "destructive", onPress: () => resolve(true) },
        { text: HOME_COPY.keepCategory, style: "cancel" },
      ],
      undefined,
      () => resolve(false)
    )
  );

export const useCategoryRename = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (category: NamedEntity, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === category.name) return;
      void writeDb.updateCategories({ ...category, name: trimmed });
    },
    [writeDb]
  );
};

export const useAssignMembers = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (item: PackItem, members: MemberPackItem[]) => {
      await writeDb.updatePackItem(withPackItemMembers(item, members));
    },
    [writeDb]
  );
};

export const useListRenamer = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (list: NamedEntity, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === list.name) return;
      void writeDb.updatePackingList({ ...list, name: trimmed });
    },
    [writeDb]
  );
};

export const useMoveCategory = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, categoryId: string) => {
      void writeDb.updatePackItem({ ...item, category: categoryId });
    },
    [writeDb]
  );
};

export const useMoveItemsToCategory = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (items: PackItem[], categoryId: string) => {
      animateLayout();
      const updatedItems = items.map((item) => ({ ...item, category: categoryId }));
      await writeDb.updatePackItemsBatched(updatedItems);
    },
    [writeDb]
  );
};

export const useCopyToList = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (item: PackItem, listId: string) => {
      await writeDb.addPackItem(item.name, item.members, item.category, listId, item.rank);
    },
    [writeDb]
  );
};

export const useSortCategoryAlpha = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (items: PackItem[]) => {
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, navigator.language));
      const updates = sorted.map((item, index) => ({
        ...item,
        rank: sorted.length - index,
      }));
      await writeDb.updatePackItemsBatched(updates);
    },
    [writeDb]
  );
};

export const hasDuplicateName = (name: string, categoryId: string, items: PackItem[], excludeId?: string) => {
  const trimmed = name.trim().toLowerCase();
  return items.some(
    (item) => item.category === categoryId && item.name.toLowerCase() === trimmed && item.id !== excludeId
  );
};
