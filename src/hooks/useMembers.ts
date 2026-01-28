import { useMemo } from "react";
import { computeMemberInitials } from "~/components/home/memberInitialsUtils.ts";
import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "members";

export const useMembers = (userId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(userId, COLLECTION);
  const memberInitials = useMemo(() => computeMemberInitials(items), [items]);
  return { members: items, memberInitials, loading };
};
