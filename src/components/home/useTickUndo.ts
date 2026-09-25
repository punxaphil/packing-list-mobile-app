import { useCallback, useEffect, useRef, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { getUndoStep, readTickHistory, saveTickHistory, type TickChange } from "./tickUndoHistory.ts";

export const useTickUndo = (
  listId: string | null | undefined,
  items: PackItem[],
  apply: (items: PackItem[]) => void
) => {
  const { spaceId } = useSpace();
  const key = listId ? `tickUndo:${spaceId}:${listId}` : "";
  const [initialHistory] = useState(() => ({ key, actions: key ? readTickHistory(key) : ([] as TickChange[][]) }));
  const historyRef = useRef(initialHistory);
  const itemsRef = useRef(items);
  const applyRef = useRef(apply);
  const [, refresh] = useState(0);
  itemsRef.current = items;
  applyRef.current = apply;

  const getActions = useCallback(() => {
    if (historyRef.current.key !== key) historyRef.current = { key, actions: key ? readTickHistory(key) : [] };
    return historyRef.current.actions;
  }, [key]);

  useEffect(() => {
    getActions();
    refresh((value) => value + 1);
  }, [getActions]);

  const record = useCallback(
    (changes: TickChange[]) => {
      if (!key || !changes.length) return;
      historyRef.current = { key, actions: saveTickHistory(key, [...getActions(), changes]) };
      refresh((value) => value + 1);
    },
    [getActions, key]
  );

  const undo = useCallback(() => {
    if (!key) return;
    const actions = getActions();
    const step = getUndoStep(itemsRef.current, actions);
    if (!step) return;
    historyRef.current = { key, actions: saveTickHistory(key, step.remaining) };
    refresh((value) => value + 1);
    applyRef.current(step.restored);
  }, [getActions, key]);

  const actions = historyRef.current.key === key ? historyRef.current.actions : key ? readTickHistory(key) : [];
  const canUndo = !!getUndoStep(items, actions);
  return { record, undo, canUndo: !!canUndo };
};
