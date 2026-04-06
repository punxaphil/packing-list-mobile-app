import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackingListSummary } from "./types.ts";

const ORDERED_SOFT_PALETTE = ["#DBEAFE", "#FCE7F3", "#DCFCE7", "#FEE2E2", "#EDE9FE", "#FEF3C7"] as const;

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

const assignOrderedColors = (entities: { id: string }[], palette: Palette) => {
  const colors: Record<string, string> = {};
  entities.forEach((entity, index) => {
    colors[entity.id] = palette[index % palette.length];
  });
  return colors;
};
