import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackingListSummary } from "./types.ts";

const PASTEL_BASE = 206;
const PASTEL_RANGE = 44;

type RankedEntity = { id: string; rank?: number | null };

export const buildListColors = (lists: PackingListSummary[]) => {
  return assignColors(lists);
};

export const buildCategoryColors = (categories: NamedEntity[]) => {
  return assignColors(categories);
};

const assignColors = (entities: RankedEntity[]) => {
  const colors: Record<string, string> = {};
  entities.forEach((entity) => {
    colors[entity.id] = createPastel(hashId(entity.id));
  });
  return colors;
};

const hashId = (id: string) => {
  let total = 0;
  for (let pointer = 0; pointer < id.length; pointer += 1) total = (total * 33 + id.charCodeAt(pointer)) & 0xffff;
  return total;
};

const createPastel = (seed: number) => {
  const red = pastelChannel(seed);
  const green = pastelChannel(seed >> 3);
  const blue = pastelChannel(seed >> 6);
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const pastelChannel = (seed: number) => PASTEL_BASE + (seed % PASTEL_RANGE);

const toHex = (value: number) => value.toString(16).padStart(2, "0");
