import { useMemo } from "react";
import { computeMemberInitials } from "~/components/home/memberInitialsUtils.ts";
import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "members";

export const useMembers = (spaceId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(spaceId, COLLECTION);
  const memberInitials = useMemo(() => computeMemberInitials(items), [items]);
  return { members: items, memberInitials, loading };
};
