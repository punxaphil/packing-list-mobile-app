import { useCallback, useEffect, useState } from "react";
import { clearSelectedId, getSelectedId, setSelectedId, subscribeToSelection } from "~/navigation/selectionState";
import { PackingListSummary, SelectionState } from "./types.ts";

export function useSelectedList(lists: PackingListSummary[] | undefined, _hasLists: boolean): SelectionState {
  const safeLists = lists ?? [];
  const [selectedId, setLocalSelectedId] = useState(getSelectedId);

  useEffect(() => {
    return subscribeToSelection(setLocalSelectedId);
  }, []);

  useEffect(() => {
    if (safeLists.length === 0) return;
    if (selectedId === "") return;
    const valid = safeLists.some((l) => l.id === selectedId);
    if (!valid) setSelectedId(safeLists[0].id);
  }, [safeLists, selectedId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    clearSelectedId();
  }, []);

  const selectedList = safeLists.find((l) => l.id === selectedId) ?? null;

  return { selectedId, selectedList, hasSelection: !!selectedId, select, clear };
}
