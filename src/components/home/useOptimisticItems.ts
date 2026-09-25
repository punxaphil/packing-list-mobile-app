import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { PackItem } from "~/types/PackItem.ts";
import { useItemTickActions } from "./useItemTickActions.ts";

type PendingChecked = Record<string, Pick<PackItem, "checked" | "members">>;

export const useOptimisticItems = (items: PackItem[], listId?: string | null) => {
  const { writeDb } = useSpace();
  const [pendingChecked, setPendingChecked] = useState<PendingChecked>({});
  const pendingRef = useRef(pendingChecked);
  const listIdRef = useRef(listId);
  pendingRef.current = pendingChecked;

  useEffect(() => {
    if (listIdRef.current === listId) return;
    listIdRef.current = listId;
    setPendingChecked({});
  }, [listId]);

  useEffect(() => {
    if (Object.keys(pendingRef.current).length === 0) return;
    setPendingChecked((prev) => {
      const next: PendingChecked = {};
      for (const [id, pending] of Object.entries(prev)) {
        const item = items.find((i) => i.id === id);
        if (
          item &&
          (item.checked !== pending.checked ||
            item.members.some((member, index) => member.checked !== pending.members[index]?.checked))
        )
          next[id] = pending;
      }
      return next;
    });
  }, [items]);

  const optimisticItems = useMemo(() => {
    const pendingKeys = Object.keys(pendingChecked);
    if (pendingKeys.length === 0) return items;
    return items.map((item) => {
      if (!(item.id in pendingChecked)) return item;
      return { ...item, ...pendingChecked[item.id] };
    });
  }, [items, pendingChecked]);

  const updateBatch = useCallback(
    (updatedItems: PackItem[]) => {
      setPendingChecked((prev) => ({ ...prev, ...Object.fromEntries(updatedItems.map((item) => [item.id, item])) }));
      void writeDb.updatePackItemsBatched(updatedItems);
    },
    [writeDb]
  );

  const updateItem = useCallback(
    (item: PackItem) => {
      setPendingChecked((prev) => ({ ...prev, [item.id]: item }));
      void writeDb.updatePackItem(item);
    },
    [writeDb]
  );

  const tickActions = useItemTickActions(optimisticItems, listId, updateItem, updateBatch);
  return { optimisticItems, ...tickActions };
};
