import { useCallback, useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { PackItem } from "~/types/PackItem.ts";

export const useMemberItemCounts = () => {
  const { writeDb } = useSpace();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(() => {
    writeDb.getPackItemsForAllPackingLists().then((items) => setCounts(computeCounts(items)));
  }, [writeDb]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, refresh };
};

const computeCounts = (items: PackItem[]): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const item of items) {
    for (const member of item.members ?? []) {
      result[member.id] = (result[member.id] ?? 0) + 1;
    }
  }
  return result;
};
