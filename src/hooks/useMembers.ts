import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "members";

export const useMembers = (userId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(userId, COLLECTION);
  return { members: items, loading };
};
