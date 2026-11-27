import { type RefObject, useCallback } from "react";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { addItemCopy } from "./listCopy.ts";
import type { useAddItemDialogState } from "./useAddItemDialogState.ts";

export type AddItemSubmit = (
  itemName: string,
  category: NamedEntity | null,
  newCategoryName: string | null,
  keepOpen: boolean,
  url?: string
) => Promise<NamedEntity>;

export const useAddItemSubmit = (
  state: ReturnType<typeof useAddItemDialogState>,
  items: PackItem[],
  showToast: (message: string) => void,
  inputRef: RefObject<HTMLInputElement | null>,
  onSubmit: AddItemSubmit
) => {
  const {
    itemName,
    itemUrl,
    selectedCategory,
    newCategoryName,
    keepOpen,
    setItemName,
    setItemUrl,
    setSelectedCategory,
    setNewCategoryName,
    setError,
  } = state;
  return useCallback(async () => {
    const trimmedName = itemName.trim();
    const categoryName = newCategoryName.trim();
    if (!trimmedName) return;
    if (!categoryName && hasDuplicateName(trimmedName, selectedCategory.id, items)) {
      setError(addItemCopy.duplicateError);
      return;
    }
    let nextCategory: NamedEntity;
    try {
      nextCategory = await onSubmit(
        trimmedName,
        categoryName ? null : selectedCategory,
        categoryName || null,
        keepOpen,
        itemUrl
      );
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        setError(addItemCopy.duplicateError);
        return;
      }
      throw error;
    }
    if (!keepOpen) return;
    setItemName("");
    setItemUrl(undefined);
    setSelectedCategory(nextCategory);
    setNewCategoryName("");
    setError(null);
    showToast(addItemCopy.added.replace("{name}", trimmedName));
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [
    itemName,
    selectedCategory,
    newCategoryName,
    items,
    setItemName,
    setSelectedCategory,
    setNewCategoryName,
    setError,
    keepOpen,
    showToast,
    inputRef,
    onSubmit,
    itemUrl,
    setItemUrl,
  ]);
};
