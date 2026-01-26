import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";

export type SectionGroup = {
  category: NamedEntity;
  items: PackItem[];
};

export const orderItems = (items: PackItem[]) =>
  [...items].sort((first, second) => {
    if (first.checked !== second.checked) {
      return Number(first.checked) - Number(second.checked);
    }
    return second.rank - first.rank;
  });

const groupItems = (items: PackItem[]) =>
  items.reduce<Map<string, PackItem[]>>((groups, item) => {
    const key = item.category || UNCATEGORIZED.id;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
    return groups;
  }, new Map());

const createCategoryMap = (categories: NamedEntity[]) => {
  const map = new Map<string, NamedEntity>();
  map.set(UNCATEGORIZED.id, UNCATEGORIZED);
  for (const category of categories) {
    map.set(category.id, category);
  }
  return map;
};

const getOrderedCategories = (
  categories: NamedEntity[],
  groups: Map<string, PackItem[]>,
) => {
  const map = createCategoryMap(categories);
  for (const [id] of groups.entries()) {
    if (id && !map.has(id)) {
      const found = categories.find((category) => category.id === id);
      if (found) {
        map.set(id, found);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.rank - a.rank);
};

export const buildSections = (
  items: PackItem[],
  categories: NamedEntity[],
): SectionGroup[] => {
  const grouped = groupItems(orderItems(items));
  return getOrderedCategories(categories, grouped).map((category) => ({
    category,
    items: grouped.get(category.id) ?? [],
  }));
};

export const getNextItemRank = (items: Pick<PackItem, "rank">[]) =>
  Math.max(...items.map((item) => item.rank).filter((rank) => Number.isFinite(rank)), 0) + 1;

export const getNextCategoryRank = (categories: Pick<NamedEntity, "rank">[]) =>
  Math.max(...categories.map((c) => c.rank ?? 0).filter((rank) => Number.isFinite(rank)), 0) + 1;
