import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPackItemChecked } from "~/services/packItemState.ts";
import type { PackItem } from "~/types/PackItem.ts";

const snapshotChecked = (items: PackItem[]) => new Map(items.map((item) => [item.id, getPackItemChecked(item)]));

export const useVisitCheckedOrder = (items: PackItem[], listId: string) => {
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [visit, setVisit] = useState(() => ({ listId, checked: snapshotChecked(items) }));

  useFocusEffect(
    useCallback(() => {
      setVisit({ listId, checked: snapshotChecked(itemsRef.current) });
    }, [listId])
  );

  useEffect(() => {
    setVisit((current) => {
      if (current.listId !== listId) return { listId, checked: snapshotChecked(items) };
      const missing = items.filter((item) => !current.checked.has(item.id));
      if (!missing.length) return current;
      const checked = new Map(current.checked);
      for (const item of missing) checked.set(item.id, getPackItemChecked(item));
      return { listId, checked };
    });
  }, [items, listId]);

  return visit.listId === listId ? visit.checked : snapshotChecked(items);
};
