import { useCallback, useEffect, useState } from "react";
import { writeDb } from "~/services/database.ts";
import { PackItem } from "~/types/PackItem.ts";

export const useMemberItemCounts = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(() => {
    writeDb.getPackItemsForAllPackingLists().then((items) => setCounts(computeCounts(items)));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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
