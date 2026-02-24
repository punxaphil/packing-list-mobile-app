import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "categories";

export const useCategories = (spaceId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(spaceId, COLLECTION);
  return { categories: items, loading };
};
