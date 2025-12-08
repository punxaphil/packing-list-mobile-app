import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutRectangle } from "react-native";
import { writeDb } from "~/services/database.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DragSnapshot } from "./useDragState.ts";

type LayoutMap = Record<string, LayoutRectangle>;
type RankUpdate = Pick<PackItem, "id" | "rank">;

type DropHandler = (snapshot: DragSnapshot, layouts: LayoutMap) => void;

type OrderedIdsState = [string[], Dispatch<SetStateAction<string[]>>];

export const useItemOrdering = (items: PackItem[]) => {
    const [orderedIds, setOrderedIds] = useOrderedIds(items);
    const orderedItems = useMemo(() => buildOrderedItems(orderedIds, items), [orderedIds, items]);
    const drop = useDropHandler(items, setOrderedIds);
    return { items: orderedItems, drop } as const;
};

const useOrderedIds = (items: PackItem[]): OrderedIdsState => {
    const [orderedIds, setOrderedIds] = useState(() => items.map((item) => item.id));
    useEffect(() => {
        setOrderedIds((current) => syncOrderedIds(current, items));
    }, [items]);
    return [orderedIds, setOrderedIds];
};

const useDropHandler = (items: PackItem[], setOrderedIds: OrderedIdsState[1]): DropHandler =>
    useCallback((snapshot, layouts) => {
        if (!snapshot) return;
        setOrderedIds((current) => {
            const preview = buildDropPreview(current, snapshot, layouts);
            const next = preview.changed ? preview.ids : current;
            if (next === current) return current;
            persistRanks(next, items);
            return next;
        });
    }, [items, setOrderedIds]);

const buildOrderedItems = (orderedIds: string[], items: PackItem[]) =>
    orderedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is PackItem => Boolean(item));

const syncOrderedIds = (current: string[], items: PackItem[]) => {
    const incoming = items.map((item) => item.id);
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

const persistRanks = (orderedIds: string[], items: PackItem[]) => {
    const updates: RankUpdate[] = [];
    orderedIds.forEach((id, index) => {
        const update = buildRankUpdate(id, index, orderedIds.length, items);
        if (update) updates.push(update);
    });
    if (!updates.length) return;
    const promises = updates.map(update => {
        const original = items.find(i => i.id === update.id);
        if (!original) return Promise.resolve();
        return writeDb.updatePackItem({ ...original, rank: update.rank });
    });
    void Promise.all(promises);
};

const buildRankUpdate = (id: string, index: number, length: number, items: PackItem[]) => {
    const match = items.find((item) => item.id === id);
    if (!match) return null;
    return {
        id: match.id,
        rank: buildRank(index, length),
    };
};

const buildRank = (index: number, length: number) => length - index;

export const computeDropIndex = (
    orderedIds: string[],
    snapshot: DragSnapshot,
    layouts: LayoutMap,
): number | null => {
    if (!snapshot) return null;
    const draggedIndex = orderedIds.indexOf(snapshot.id);
    if (draggedIndex < 0) return null;
    const draggedLayout = layouts[snapshot.id];
    if (!draggedLayout) return null;
    return resolveTargetIndex(orderedIds, draggedIndex, draggedLayout, snapshot.offsetY, layouts);
};
