import { useEffect, useState } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { SelectionState } from "./types.ts";

const EMPTY_LIST: NamedEntity[] = [];

const filterSelection = (
  lists: NamedEntity[],
  id: string,
  hasLists: boolean,
) => (!hasLists ? "" : lists.some((item) => item.id === id) ? id : "");

export function useSelectedList(
  lists: NamedEntity[] | undefined,
  hasLists: boolean,
): SelectionState {
  const safeLists = lists ?? EMPTY_LIST;
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => setSelectedId((value) => filterSelection(safeLists, value, hasLists)), [safeLists, hasLists]);
  const selectedList = safeLists.find((item) => item.id === selectedId) ?? null;
  return { selectedId, selectedList, hasSelection: selectedId.length > 0, select: setSelectedId, clear: () => setSelectedId("") };
}
