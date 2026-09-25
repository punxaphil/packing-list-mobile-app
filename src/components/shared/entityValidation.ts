import { normalizePackItem } from "~/services/packItemState.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";

export const hasDuplicateEntityName = (name: string, entities: NamedEntity[], excludeId?: string) => {
  const trimmed = name.trim().toLowerCase();
  return entities.some((entity) => entity.name.toLowerCase() === trimmed && entity.id !== excludeId);
};

export const getEntitiesWithoutItems = <T extends NamedEntity>(
  entities: T[],
  items: PackItem[],
  hasItem: (entity: T, item: PackItem) => boolean
) => entities.filter((entity) => !items.some((item) => hasItem(entity, normalizePackItem(item))));
