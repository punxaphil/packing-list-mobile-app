import { NamedEntity } from "~/types/NamedEntity.ts";

export const hasDuplicateEntityName = (name: string, entities: NamedEntity[], excludeId?: string) => {
  const trimmed = name.trim().toLowerCase();
  return entities.some((entity) => entity.name.toLowerCase() === trimmed && entity.id !== excludeId);
};
