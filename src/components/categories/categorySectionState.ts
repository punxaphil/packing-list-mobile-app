import { useCallback } from "react";
import { Alert } from "react-native";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { CATEGORY_COPY } from "./styles.ts";
import { animateLayout, animateListEntry } from "../home/layoutAnimation.ts";

export type CategoryActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (category: NamedEntity) => Promise<void>;
  onRename: (category: NamedEntity, name: string) => Promise<void>;
};

export const useCategoryActions = (categories: NamedEntity[]): CategoryActions => ({
  onAdd: useAddCategory(categories),
  onDelete: useDeleteCategory(),
  onRename: useRenameCategory(),
});

const useRenameCategory = () =>
  useCallback(async (category: NamedEntity, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) return;
    await writeDb.updateCategories({ ...category, name: trimmed });
  }, []);

const useAddCategory = (categories: NamedEntity[]) =>
  useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    animateListEntry();
    await writeDb.addCategory(trimmed, getNextRank(categories));
  }, [categories]);

const useDeleteCategory = () =>
  useCallback(async (category: NamedEntity) => {
    const label = category.name?.trim() ? category.name : CATEGORY_COPY.delete;
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    animateLayout();
    await writeDb.deleteCategory(category.id, [], true);
  }, []);

const getNextRank = (categories: NamedEntity[]) =>
  Math.max(...categories.map((c) => c.rank ?? 0), 0) + 1;

const confirmDelete = (name: string) =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      CATEGORY_COPY.deleteConfirmTitle,
      CATEGORY_COPY.deleteConfirmMessage.replace("{name}", name),
      [
        { text: CATEGORY_COPY.cancel, style: "cancel", onPress: () => resolve(false) },
        { text: CATEGORY_COPY.deleteAction, style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
