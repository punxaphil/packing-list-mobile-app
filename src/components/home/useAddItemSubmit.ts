import { type RefObject, useCallback } from "react";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { addItemCopy } from "./listCopy.ts";

export type AddItemSubmit = (
  itemName: string,
  category: NamedEntity | null,
  newCategoryName: string | null,
  keepOpen: boolean
) => Promise<NamedEntity>;

export const useAddItemSubmit = (
  itemName: string,
  selectedCategory: NamedEntity,
  newCategoryName: string,
  hasNewCategory: boolean,
  items: PackItem[],
  targetCategoryId: string,
  setItemName: (value: string) => void,
  setSelectedCategory: (category: NamedEntity) => void,
  setNewCategoryName: (value: string) => void,
  setError: (error: string | null) => void,
  keepOpen: boolean,
  showToast: (message: string) => void,
  inputRef: RefObject<HTMLInputElement | null>,
  onSubmit: AddItemSubmit
) =>
  useCallback(async () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    if (!hasNewCategory && hasDuplicateName(trimmedName, targetCategoryId, items)) {
      setError(addItemCopy.duplicateError);
      return;
    }
    let nextCategory: NamedEntity;
    try {
      nextCategory = await onSubmit(
        trimmedName,
        hasNewCategory ? null : selectedCategory,
        hasNewCategory ? newCategoryName.trim() : null,
        keepOpen
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
    hasNewCategory,
    items,
    targetCategoryId,
    setItemName,
    setSelectedCategory,
    setNewCategoryName,
    setError,
    keepOpen,
    showToast,
    inputRef,
    onSubmit,
  ]);
