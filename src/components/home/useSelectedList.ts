import { useCallback, useEffect, useState } from "react";
import { showMainTabs } from "~/navigation/navigation.ts";
import { clearSelectedId, getSelectedId, setSelectedId, subscribeToSelection } from "~/navigation/selectionState";
import { PackingListSummary, SelectionState } from "./types.ts";

export function useSelectedList(
  lists: PackingListSummary[] | undefined,
  _hasLists: boolean,
  listsLoading: boolean
): SelectionState {
  const safeLists = lists ?? [];
  const [selectedId, setLocalSelectedId] = useState(getSelectedId);

  useEffect(() => {
    return subscribeToSelection(setLocalSelectedId);
  }, []);

  useEffect(() => {
    if (listsLoading) return;
    if (selectedId === "") return;
    const valid = safeLists.some((l) => l.id === selectedId);
    if (!valid) {
      clearSelectedId();
      showMainTabs(false);
    }
  }, [listsLoading, safeLists, selectedId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    clearSelectedId();
  }, []);

  const selectedList = safeLists.find((l) => l.id === selectedId) ?? null;

  return { selectedId: selectedList?.id ?? "", selectedList, hasSelection: selectedList !== null, select, clear };
}
