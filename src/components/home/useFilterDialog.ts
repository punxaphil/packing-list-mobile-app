import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";

export type FilterDialogState = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  members: NamedEntity[];
  selectedMembers: string[];
  hasActiveFilter: boolean;
  open: () => void;
  close: () => void;
  onToggleCategory: (categoryId: string) => void;
  onToggleMember: (memberId: string) => void;
  onClear: () => void;
};

const CATEGORY_KEY = "filteredCategories";
const MEMBER_KEY = "filteredMembers";

const getMembersInList = (members: NamedEntity[], items: PackItem[]) => {
  const memberIds = new Set(items.flatMap((i) => i.members.map((m) => m.id)));
  return members.filter((m) => memberIds.has(m.id)).sort((a, b) => b.rank - a.rank);
};

export const useFilterDialog = (categories: NamedEntity[], members: NamedEntity[], items: PackItem[]): FilterDialogState => {
  const [visible, setVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const membersInList = getMembersInList(members, items);

  useEffect(() => {
    AsyncStorage.getItem(CATEGORY_KEY).then((saved) => { if (saved) setSelectedCategories(JSON.parse(saved)); });
    AsyncStorage.getItem(MEMBER_KEY).then((saved) => { if (saved) setSelectedMembers(JSON.parse(saved)); });
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const onToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((current) => {
      const updated = current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId];
      AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const onToggleMember = useCallback((memberId: string) => {
    setSelectedMembers((current) => {
      const updated = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
      AsyncStorage.setItem(MEMBER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const onClear = useCallback(() => {
    setSelectedCategories([]);
    setSelectedMembers([]);
    AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify([]));
    AsyncStorage.setItem(MEMBER_KEY, JSON.stringify([]));
  }, []);

  const hasActiveFilter = selectedCategories.length > 0 || selectedMembers.length > 0;
  return { visible, categories, selectedCategories, members: membersInList, selectedMembers, hasActiveFilter, open, close, onToggleCategory, onToggleMember, onClear };
};
