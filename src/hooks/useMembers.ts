import { useMemo } from "react";
import { computeMemberInitials, computeMemberNames } from "~/components/home/memberInitialsUtils.ts";
import { useNamedEntities } from "./useNamedEntities.ts";

const COLLECTION = "members";

export const useMembers = (spaceId: string | null | undefined) => {
  const { items, loading } = useNamedEntities(spaceId, COLLECTION);
  const memberInitials = useMemo(() => computeMemberInitials(items), [items]);
  const memberNames = useMemo(() => computeMemberNames(items), [items]);
  return { members: items, memberInitials, memberNames, loading };
};
