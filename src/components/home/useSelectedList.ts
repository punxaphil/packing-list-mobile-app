import { useEffect, useState } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { SelectionState } from "./types.ts";

const EMPTY_LIST: NamedEntity[] = [];

function selectNextId(
  lists: NamedEntity[],
  hasLists: boolean,
  currentId: string,
) {
  if (!hasLists || lists.length === 0) return "";
  const match = lists.find((item) => item.id === currentId);
  return (match ?? lists[0]).id;
}

export function useSelectedList(
  lists: NamedEntity[] | undefined,
  hasLists: boolean,
): SelectionState {
  const safeLists = lists ?? EMPTY_LIST;
  const [selectedId, setSelectedId] = useState("");
  useEffect(
    () => setSelectedId((value) => selectNextId(safeLists, hasLists, value)),
    [safeLists, hasLists],
  );
  const selectedList = safeLists.find((item) => item.id === selectedId) ?? null;
  return { selectedId, selectedList, select: setSelectedId };
}
