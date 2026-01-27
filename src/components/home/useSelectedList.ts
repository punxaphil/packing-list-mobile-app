import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { PackingListSummary, SelectionState } from "./types.ts";

const STORAGE_KEY = "selectedListId";

export function useSelectedList(lists: PackingListSummary[] | undefined, _hasLists: boolean): SelectionState {
  const safeLists = lists ?? [];
  const [selectedId, setSelectedId] = useState("");
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    AsyncStorage.getItem(STORAGE_KEY).then((id) => {
      if (id) setSelectedId(id);
    });
  }, []);

  useEffect(() => {
    if (safeLists.length === 0) return;
    if (selectedId === "") return;
    const valid = safeLists.some((l) => l.id === selectedId);
    if (!valid) setSelectedId(safeLists[0].id);
  }, [safeLists, selectedId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  }, []);

  const clear = useCallback(() => {
    setSelectedId("");
    AsyncStorage.setItem(STORAGE_KEY, "");
  }, []);

  const selectedList = safeLists.find((l) => l.id === selectedId) ?? null;

  return { selectedId, selectedList, hasSelection: !!selectedId, select, clear };
}
