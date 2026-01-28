import { UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

export const WITHOUT_MEMBERS_ID = "__WITHOUT_MEMBERS__";

const filterItemsByCategory = (items: PackItem[], selectedCategories: string[]) => {
  if (selectedCategories.length === 0) return items;
  return items.filter((item) => selectedCategories.includes(item.category));
};

const filterItemsByMember = (items: PackItem[], selectedMembers: string[]) => {
  if (selectedMembers.length === 0) return items;
  const withoutMembersSelected = selectedMembers.includes(WITHOUT_MEMBERS_ID);
  const actualMemberIds = selectedMembers.filter((id) => id !== WITHOUT_MEMBERS_ID);
  return items.filter((item) => {
    const hasNoMembers = item.members.length === 0;
    if (withoutMembersSelected && hasNoMembers) return true;
    if (actualMemberIds.length === 0) return false;
    return item.members.some((m) => actualMemberIds.includes(m.id));
  });
};

const filterItemsByStatus = (items: PackItem[], status: StatusFilter) => {
  if (status === "all") return items;
  return items.filter((item) => (status === "packed" ? item.checked : !item.checked));
};

export const applyFilters = (
  items: PackItem[],
  selectedCategories: string[],
  selectedMembers: string[],
  status: StatusFilter
) => {
  const byCategory = filterItemsByCategory(items, selectedCategories);
  const byMember = filterItemsByMember(byCategory, selectedMembers);
  return filterItemsByStatus(byMember, status);
};

export const findMatchingItemIds = (items: PackItem[], searchText: string, categories: NamedEntity[]): string[] => {
  const trimmed = searchText.trim().toLowerCase();
  if (!trimmed) return [];
  const matches = items.filter((item) => item.name.toLowerCase().includes(trimmed));
  const categoryRankMap = new Map<string, number>(categories.map((c) => [c.id, c.rank]));
  categoryRankMap.set(UNCATEGORIZED.id, -Infinity);
  const getCategoryRank = (item: PackItem) => categoryRankMap.get(item.category || UNCATEGORIZED.id) ?? -Infinity;
  const sorted = [...matches].sort((a, b) => {
    const catRankDiff = getCategoryRank(b) - getCategoryRank(a);
    if (catRankDiff !== 0) return catRankDiff;
    if (a.checked !== b.checked) return Number(a.checked) - Number(b.checked);
    return b.rank - a.rank;
  });
  return sorted.map((item) => item.id);
};
