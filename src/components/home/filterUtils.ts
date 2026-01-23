import { PackItem } from "~/types/PackItem.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

export const filterItemsByCategory = (items: PackItem[], selectedCategories: string[]) => {
  if (selectedCategories.length === 0) return items;
  return items.filter((item) => selectedCategories.includes(item.category));
};

export const filterItemsByMember = (items: PackItem[], selectedMembers: string[]) => {
  if (selectedMembers.length === 0) return items;
  return items.filter((item) => item.members.some((m) => selectedMembers.includes(m.id)));
};

export const filterItemsByStatus = (items: PackItem[], status: StatusFilter) => {
  if (status === "all") return items;
  return items.filter((item) => status === "packed" ? item.checked : !item.checked);
};

export const applyFilters = (items: PackItem[], selectedCategories: string[], selectedMembers: string[], status: StatusFilter) => {
  const byCategory = filterItemsByCategory(items, selectedCategories);
  const byMember = filterItemsByMember(byCategory, selectedMembers);
  return filterItemsByStatus(byMember, status);
};
