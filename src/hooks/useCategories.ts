import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "categories";

export const useCategories = (userId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(userId, COLLECTION);
  return { categories: items, loading };
};
