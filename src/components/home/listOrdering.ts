import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutRectangle } from "react-native";
import { writeDb } from "~/services/database.ts";
import { PackingListSummary } from "./types.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";

export type DragSnapshot = { id: string; offsetY: number } | null;

type LayoutMap = Record<string, LayoutRectangle>;
type RankUpdate = Pick<NamedEntity, "id" | "name" | "rank"> & Partial<Pick<NamedEntity, "image" | "color">>;

type DropHandler = (snapshot: DragSnapshot, layouts: LayoutMap) => void;

type OrderedIdsState = [string[], Dispatch<SetStateAction<string[]>>];

export const useListOrdering = (lists: PackingListSummary[]) => {
    const [orderedIds, setOrderedIds] = useOrderedIds(lists);
    const orderedLists = useMemo(() => buildOrderedLists(orderedIds, lists), [orderedIds, lists]);
    const drop = useDropHandler(lists, setOrderedIds);
    return { lists: orderedLists, drop } as const;
};

const useOrderedIds = (lists: PackingListSummary[]): OrderedIdsState => {
    const [orderedIds, setOrderedIds] = useState(() => lists.map((list) => list.id));
    useEffect(() => {
        setOrderedIds((current) => syncOrderedIds(current, lists));
    }, [lists]);
    return [orderedIds, setOrderedIds];
};

const useDropHandler = (lists: PackingListSummary[], setOrderedIds: OrderedIdsState[1]): DropHandler =>
    useCallback((snapshot, layouts) => {
        if (!snapshot) return;
        setOrderedIds((current) => {
            const preview = buildDropPreview(current, snapshot, layouts);
            const next = preview.changed ? preview.ids : current;
            if (next === current) return current;
            persistRanks(next, lists);
            return next;
        });
    }, [lists, setOrderedIds]);

const buildOrderedLists = (orderedIds: string[], lists: PackingListSummary[]) =>
    orderedIds
        .map((id) => lists.find((list) => list.id === id))
        .filter((list): list is PackingListSummary => Boolean(list));

const syncOrderedIds = (current: string[], lists: PackingListSummary[]) => {
    const incoming = lists.map((list) => list.id);
    const filtered = current.filter((id) => incoming.includes(id));
    const missing = incoming.filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
};

const buildDropPreview = (current: string[], snapshot: DragSnapshot, layouts: LayoutMap) => {
    if (!snapshot) return { ids: current, changed: false };
    const draggedIndex = current.indexOf(snapshot.id);
    if (draggedIndex < 0) return { ids: current, changed: false };
    const draggedLayout = layouts[snapshot.id];
    if (!draggedLayout) return { ids: current, changed: false };
    const targetIndex = resolveTargetIndex(current, draggedIndex, draggedLayout, snapshot.offsetY, layouts);
    if (targetIndex === draggedIndex) return { ids: current, changed: false };
    const ids = moveItem(current, draggedIndex, targetIndex);
    return { ids, changed: true };
};

const resolveTargetIndex = (
    ids: string[],
    fromIndex: number,
    draggedLayout: LayoutRectangle,
    offsetY: number,
    layouts: LayoutMap,
) => {
    if (!offsetY) return fromIndex;
    if (offsetY > 0) return resolveDownwardIndex(ids, fromIndex, draggedLayout, offsetY, layouts);
    return resolveUpwardIndex(ids, fromIndex, draggedLayout, offsetY, layouts);
};

const resolveDownwardIndex = (
    ids: string[],
    fromIndex: number,
    draggedLayout: LayoutRectangle,
    offsetY: number,
    layouts: LayoutMap,
) => {
    let target = fromIndex;
    const ghostBottom = draggedLayout.y + draggedLayout.height + offsetY;
    for (let index = fromIndex + 1; index < ids.length; index += 1) {
        const layout = layouts[ids[index]];
        if (!layout) continue;
        const center = layout.y + layout.height / 2;
        if (ghostBottom >= center) {
            target = index;
            continue;
        }
        break;
    }
    return target;
};

const resolveUpwardIndex = (
    ids: string[],
    fromIndex: number,
    draggedLayout: LayoutRectangle,
    offsetY: number,
    layouts: LayoutMap,
) => {
    let target = fromIndex;
    const ghostTop = draggedLayout.y + offsetY;
    for (let index = fromIndex - 1; index >= 0; index -= 1) {
        const layout = layouts[ids[index]];
        if (!layout) continue;
        const center = layout.y + layout.height / 2;
        if (ghostTop <= center) {
            target = index;
            continue;
        }
        break;
    }
    return target;
};

const moveItem = (ids: string[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return ids;
    const next = [...ids];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
};

const persistRanks = (orderedIds: string[], lists: PackingListSummary[]) => {
    const updates: RankUpdate[] = [];
    orderedIds.forEach((id, index) => {
        const update = buildRankUpdate(id, index, orderedIds.length, lists);
        if (update) updates.push(update);
    });
    if (!updates.length) return;
    void writeDb.updatePackingLists(updates);
};

const buildRankUpdate = (id: string, index: number, length: number, lists: PackingListSummary[]) => {
    const match = lists.find((list) => list.id === id);
    if (!match) return null;
    const update: RankUpdate = {
        id: match.id,
        name: match.name,
        rank: buildRank(index, length),
    };
    if (match.image) update.image = match.image;
    if (match.color) update.color = match.color;
    return update;
};

const buildRank = (index: number, length: number) => length - index;

const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);
