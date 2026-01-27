import { useCallback, useEffect, useRef, useState } from "react";
import { PackItem } from "~/types/PackItem.ts";
import { writeDb } from "~/services/database.ts";
import { animateLayout } from "./layoutAnimation.ts";

type PendingChecked = Record<string, boolean>;

export const useOptimisticItems = (items: PackItem[]) => {
  const [pendingChecked, setPendingChecked] = useState<PendingChecked>({});
  const pendingRef = useRef(pendingChecked);
  pendingRef.current = pendingChecked;

  useEffect(() => {
    if (Object.keys(pendingRef.current).length === 0) return;
    setPendingChecked((prev) => {
      const next: PendingChecked = {};
      for (const [id, checked] of Object.entries(prev)) {
        const item = items.find((i) => i.id === id);
        if (item && item.checked !== checked) next[id] = checked;
      }
      return next;
    });
  }, [items]);

  const optimisticItems = items.map((item) =>
    item.id in pendingChecked ? { ...item, checked: pendingChecked[item.id] } : item
  );

  const toggleCategory = useCallback(async (categoryItems: PackItem[], checked: boolean) => {
    animateLayout();
    const pending: PendingChecked = {};
    for (const item of categoryItems) pending[item.id] = checked;
    setPendingChecked((prev) => ({ ...prev, ...pending }));
    const updatedItems = categoryItems.map((item) => ({ ...item, checked }));
    await writeDb.updatePackItemsBatched(updatedItems);
  }, []);

  const toggleItem = useCallback(async (item: PackItem) => {
    animateLayout();
    const newChecked = !item.checked;
    setPendingChecked((prev) => ({ ...prev, [item.id]: newChecked }));
    await writeDb.updatePackItem({ ...item, checked: newChecked });
  }, []);

  return { optimisticItems, toggleCategory, toggleItem };
};
