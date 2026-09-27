import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { PackItem } from "~/types/PackItem.ts";
import { useItemTickActions } from "./useItemTickActions.ts";

type PendingChecked = Record<string, { item: PackItem; settled: boolean }>;

const checkedMatches = (item: PackItem, pending: PackItem) =>
  item.checked === pending.checked &&
  item.members.every((member, index) => member.checked === pending.members[index]?.checked);

const reconcilePending = (pending: PendingChecked, items: PackItem[]) => {
  const next = Object.fromEntries(
    Object.entries(pending).filter(([id, change]) => {
      const item = items.find((entry) => entry.id === id);
      return item && (!change.settled || !checkedMatches(item, change.item));
    })
  );
  return Object.keys(next).length === Object.keys(pending).length ? pending : next;
};

export const useOptimisticItems = (items: PackItem[], listId?: string | null) => {
  const { writeDb } = useSpace();
  const [pendingChecked, setPendingChecked] = useState<PendingChecked>({});
  const pendingRef = useRef(pendingChecked);
  const listIdRef = useRef(listId);
  const itemsRef = useRef(items);
  pendingRef.current = pendingChecked;
  itemsRef.current = items;

  useEffect(() => {
    if (listIdRef.current === listId) return;
    listIdRef.current = listId;
    setPendingChecked({});
  }, [listId]);

  useEffect(() => {
    if (Object.keys(pendingRef.current).length === 0) return;
    setPendingChecked((prev) => reconcilePending(prev, items));
  }, [items]);

  const optimisticItems = useMemo(() => {
    const pendingKeys = Object.keys(pendingChecked);
    if (pendingKeys.length === 0) return items;
    return items.map((item) => {
      if (!(item.id in pendingChecked)) return item;
      return { ...item, ...pendingChecked[item.id].item };
    });
  }, [items, pendingChecked]);

  const settle = useCallback((updatedItems: PackItem[]) => {
    setPendingChecked((prev) => {
      const next = { ...prev };
      for (const item of updatedItems) {
        if (next[item.id]?.item === item) next[item.id] = { item, settled: true };
      }
      return reconcilePending(next, itemsRef.current);
    });
  }, []);

  const discard = useCallback((updatedItems: PackItem[]) => {
    setPendingChecked((prev) => {
      const next = { ...prev };
      for (const item of updatedItems) if (next[item.id]?.item === item) delete next[item.id];
      return next;
    });
  }, []);

  const updateBatch = useCallback(
    (updatedItems: PackItem[]) => {
      setPendingChecked((prev) => ({
        ...prev,
        ...Object.fromEntries(updatedItems.map((item) => [item.id, { item, settled: false }])),
      }));
      void writeDb.updatePackItemsBatched(updatedItems).then(
        () => settle(updatedItems),
        () => discard(updatedItems)
      );
    },
    [writeDb, settle, discard]
  );

  const updateItem = useCallback(
    (item: PackItem) => {
      setPendingChecked((prev) => ({ ...prev, [item.id]: { item, settled: false } }));
      void writeDb.updatePackItem(item).then(
        () => settle([item]),
        () => discard([item])
      );
    },
    [writeDb, settle, discard]
  );

  const tickActions = useItemTickActions(optimisticItems, listId, updateItem, updateBatch);
  return { optimisticItems, ...tickActions };
};
