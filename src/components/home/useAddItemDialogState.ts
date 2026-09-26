import { useEffect, useState } from "react";
import { UNCATEGORIZED } from "~/services/utils.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";

export const useAddItemDialogState = (visible: boolean, initialCategory?: NamedEntity) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setItemName("");
      setSelectedCategory(initialCategory ?? UNCATEGORIZED);
      setNewCategoryName("");
      setError(null);
    }
  }, [visible, initialCategory]);
  return {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setKeepOpen,
    error,
    setError,
  };
};
