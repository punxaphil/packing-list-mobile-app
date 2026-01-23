import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NamedEntity } from "~/types/NamedEntity.ts";

export type FilterDialogState = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  hasActiveFilter: boolean;
  open: () => void;
  close: () => void;
  onToggle: (categoryId: string) => void;
  onClear: () => void;
};

const STORAGE_KEY = "filteredCategories";

export const useFilterDialog = (categoriesInList: NamedEntity[]): FilterDialogState => {
  const [visible, setVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setSelectedCategories(JSON.parse(saved));
    });
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const onToggle = useCallback((categoryId: string) => {
    setSelectedCategories((current) => {
      const updated = current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const onClear = useCallback(() => {
    setSelectedCategories([]);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }, []);

  return { visible, categories: categoriesInList, selectedCategories, hasActiveFilter: selectedCategories.length > 0, open, close, onToggle, onClear };
};
