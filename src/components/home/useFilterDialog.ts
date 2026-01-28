import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState, useTransition } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { homeCopy } from "./copy.ts";
import { WITHOUT_MEMBERS_ID } from "./filterUtils.ts";

export type StatusFilter = "all" | "packed" | "unpacked";

export type FilterDialogState = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  members: NamedEntity[];
  selectedMembers: string[];
  statusFilter: StatusFilter;
  hasActiveFilter: boolean;
  open: () => void;
  close: () => void;
  onToggleCategory: (categoryId: string) => void;
  onToggleMember: (memberId: string) => void;
  onSetStatus: (status: StatusFilter) => void;
  onClear: () => void;
};

const CATEGORY_KEY = "filteredCategories";
const MEMBER_KEY = "filteredMembers";
const STATUS_KEY = "filteredStatus";

const WITHOUT_MEMBERS: NamedEntity = { id: WITHOUT_MEMBERS_ID, name: homeCopy.withoutMembers, rank: Infinity };

const getMembersInList = (members: NamedEntity[], items: PackItem[]) => {
  const memberIds = new Set(items.flatMap((i) => i.members.map((m) => m.id)));
  const filtered = members.filter((m) => memberIds.has(m.id)).sort((a, b) => b.rank - a.rank);
  return [WITHOUT_MEMBERS, ...filtered];
};

export const useFilterDialog = (
  categories: NamedEntity[],
  members: NamedEntity[],
  items: PackItem[],
  _listId?: string
): FilterDialogState => {
  const [visible, setVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [, startTransition] = useTransition();
  const membersInList = getMembersInList(members, items);

  useEffect(() => {
    AsyncStorage.getItem(CATEGORY_KEY).then((saved) => {
      if (saved) setSelectedCategories(JSON.parse(saved));
    });
    AsyncStorage.getItem(MEMBER_KEY).then((saved) => {
      if (saved) setSelectedMembers(JSON.parse(saved));
    });
    AsyncStorage.getItem(STATUS_KEY).then((saved) => {
      if (saved) setStatusFilter(saved as StatusFilter);
    });
  }, []);

  useEffect(() => {
    setSelectedCategories([]);
    setSelectedMembers([]);
    setStatusFilter("all");
    AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify([]));
    AsyncStorage.setItem(MEMBER_KEY, JSON.stringify([]));
    AsyncStorage.setItem(STATUS_KEY, "all");
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const onToggleCategory = useCallback((categoryId: string) => {
    startTransition(() => {
      setSelectedCategories((current) => {
        const updated = current.includes(categoryId)
          ? current.filter((id) => id !== categoryId)
          : [...current, categoryId];
        AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));
        return updated;
      });
    });
  }, []);

  const onToggleMember = useCallback((memberId: string) => {
    startTransition(() => {
      setSelectedMembers((current) => {
        const updated = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
        AsyncStorage.setItem(MEMBER_KEY, JSON.stringify(updated));
        return updated;
      });
    });
  }, []);

  const onSetStatus = useCallback((status: StatusFilter) => {
    startTransition(() => {
      setStatusFilter(status);
      AsyncStorage.setItem(STATUS_KEY, status);
    });
  }, []);

  const onClear = useCallback(() => {
    startTransition(() => {
      setSelectedCategories([]);
      setSelectedMembers([]);
      setStatusFilter("all");
      AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify([]));
      AsyncStorage.setItem(MEMBER_KEY, JSON.stringify([]));
      AsyncStorage.setItem(STATUS_KEY, "all");
    });
  }, []);

  const hasActiveFilter = selectedCategories.length > 0 || selectedMembers.length > 0 || statusFilter !== "all";
  return {
    visible,
    categories,
    selectedCategories,
    members: membersInList,
    selectedMembers,
    statusFilter,
    hasActiveFilter,
    open,
    close,
    onToggleCategory,
    onToggleMember,
    onSetStatus,
    onClear,
  };
};
