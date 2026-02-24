import { useCallback, useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { PackItem } from "~/types/PackItem.ts";

export const useCategoryItemCounts = () => {
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
    if (item.category) {
      result[item.category] = (result[item.category] ?? 0) + 1;
    }
  }
  return result;
};
