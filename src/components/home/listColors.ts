import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackingListSummary } from "./types.ts";

const ORDERED_SOFT_PALETTE = ["#DBEAFE", "#FCE7F3", "#DCFCE7", "#FEE2E2", "#EDE9FE", "#FEF3C7"] as const;
const ORDERED_STRONG_PALETTE = ["#54A2FB", "#EC4899", "#22C55E", "#EF4444", "#8B5CF6", "#F59E0B"] as const;

type Palette = readonly string[];

export const buildListColors = (lists: PackingListSummary[]) => {
  return assignOrderedColors(lists, ORDERED_SOFT_PALETTE);
};

export const buildItemCategoryColors = (categories: NamedEntity[]) => {
  return assignOrderedColors(categories, ORDERED_SOFT_PALETTE);
};

export const buildEntityColors = (entities: NamedEntity[]) => {
  return assignOrderedColors(entities, ORDERED_SOFT_PALETTE);
};

export const getItemCheckboxColor = (color: string) => {
  const index = ORDERED_SOFT_PALETTE.indexOf(color as (typeof ORDERED_SOFT_PALETTE)[number]);
  return index === -1 ? ORDERED_STRONG_PALETTE[0] : ORDERED_STRONG_PALETTE[index];
};

const assignOrderedColors = (entities: { id: string }[], palette: Palette) => {
  const colors: Record<string, string> = {};
  entities.forEach((entity, index) => {
    colors[entity.id] = palette[index % palette.length];
  });
  return colors;
};
