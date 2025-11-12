import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";

export type SectionGroup = {
  category: NamedEntity;
  items: PackItem[];
};

const orderItems = (items: PackItem[]) =>
  [...items].sort((first, second) => second.rank - first.rank);

const groupItems = (items: PackItem[]) =>
  items.reduce<Map<string, PackItem[]>>((groups, item) => {
    const key = item.category || UNCATEGORIZED.id;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
    return groups;
  }, new Map());

const getOrderedCategories = (
  categories: NamedEntity[],
  groups: Map<string, PackItem[]>,
) => {
  const sorted = categories
    .filter((category) => category.id && groups.has(category.id))
    .sort((a, b) => b.rank - a.rank);
  return groups.has(UNCATEGORIZED.id) ? [UNCATEGORIZED, ...sorted] : sorted;
};

export const buildSections = (
  items: PackItem[],
  categories: NamedEntity[],
): SectionGroup[] => {
  const grouped = groupItems(orderItems(items));
  return getOrderedCategories(categories, grouped)
    .map((category) => ({
      category,
      items: grouped.get(category.id) ?? [],
    }))
    .filter((section) => section.items.length);
};
