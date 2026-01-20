import { useEffect, useState } from "react";
import { writeDb } from "~/services/database.ts";
import { PackItem } from "~/types/PackItem.ts";

export const useCategoryItemCounts = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    writeDb.getPackItemsForAllPackingLists().then((items) => setCounts(computeCounts(items)));
  }, []);

  return counts;
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
