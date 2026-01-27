import { useCallback, useEffect, useRef, useState } from "react";
import { writeDb } from "~/services/database.ts";
import { PackItem } from "~/types/PackItem.ts";
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

  const optimisticItems = items.map((item) => {
    if (!(item.id in pendingChecked)) return item;
    const checked = pendingChecked[item.id];
    const members = item.members.map((m) => ({ ...m, checked }));
    return { ...item, checked, members };
  });

  const toggleCategory = useCallback((categoryItems: PackItem[], checked: boolean) => {
    const pending: PendingChecked = {};
    for (const item of categoryItems) pending[item.id] = checked;
    setPendingChecked((prev) => ({ ...prev, ...pending }));
    const updatedItems = categoryItems.map((item) => ({
      ...item,
      checked,
      members: item.members.map((m) => ({ ...m, checked })),
    }));
    void writeDb.updatePackItemsBatched(updatedItems);
  }, []);

  const toggleItem = useCallback(async (item: PackItem) => {
    animateLayout();
    const newChecked = !item.checked;
    setPendingChecked((prev) => ({ ...prev, [item.id]: newChecked }));
    await writeDb.updatePackItem({ ...item, checked: newChecked });
  }, []);

  return { optimisticItems, toggleCategory, toggleItem };
};
