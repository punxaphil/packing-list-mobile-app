import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutAnimation, LayoutRectangle } from "react-native";
import { writeDb } from "~/services/database.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DragSnapshot } from "./useDragState.ts";

type LayoutMap = Record<string, LayoutRectangle>;
type RankUpdate = Pick<PackItem, "id" | "rank"> & { category?: string };

type DropHandler = (
    snapshot: DragSnapshot,
    layouts: LayoutMap,
    sectionLayouts: LayoutMap,
    bodyLayouts: LayoutMap
) => void;

type OrderedIdsState = [string[], Dispatch<SetStateAction<string[]>>];

export const useItemOrdering = (items: PackItem[]) => {
    const [orderedIds, setOrderedIds] = useOrderedIds(items);
    const orderedItems = useMemo(() => buildOrderedItems(orderedIds, items), [orderedIds, items]);
    const drop = useDropHandler(orderedIds, items, setOrderedIds);
    return { items: orderedItems, drop } as const;
};

const useOrderedIds = (items: PackItem[]): OrderedIdsState => {
    const [orderedIds, setOrderedIds] = useState(() => items.map((item) => item.id));
    useEffect(() => {
        setOrderedIds((current) => syncOrderedIds(current, items));
    }, [items]);
    return [orderedIds, setOrderedIds];
};

const useDropHandler = (orderedIds: string[], items: PackItem[], setOrderedIds: OrderedIdsState[1]): DropHandler =>
    useCallback((snapshot, layouts, sectionLayouts, bodyLayouts) => {
        if (!snapshot) return;
        const preview = buildDropPreview(orderedIds, snapshot, layouts, sectionLayouts, bodyLayouts, items);
        if (!preview.changed) return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOrderedIds(preview.ids);
        persistRanks(preview.ids, items, snapshot.id, preview.targetCategoryId);
    }, [orderedIds, items, setOrderedIds]);

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

const buildDropPreview = (
    current: string[],
    snapshot: DragSnapshot,
    layouts: LayoutMap,
    sectionLayouts: LayoutMap,
    bodyLayouts: LayoutMap,
    items: PackItem[]
) => {
    if (!snapshot) return { ids: current, changed: false };

    // 1. Calculate drop position globally
    const draggedItem = items.find(item => item.id === snapshot.id);
    if (!draggedItem) return { ids: current, changed: false };

    const startAbsY = getAbsoluteY(snapshot.id, draggedItem.category, layouts, sectionLayouts, bodyLayouts);
    if (startAbsY === null) return { ids: current, changed: false };

    const draggedLayout = layouts[snapshot.id];
    if (!draggedLayout) return { ids: current, changed: false };

    const ghostAbsY = startAbsY + snapshot.offsetY;
    const ghostAbsCenterY = ghostAbsY + draggedLayout.height / 2;

    // 2. Determine target category from drop position
    const targetCategoryId = getCategoryAtY(ghostAbsCenterY, sectionLayouts);


    if (targetCategoryId === null) {
        // If no category found (e.g. dropped outside bounds), cancel or keep original?
        // Let's assume keep original if we can't find better.
        return { ids: current, changed: false };
    }

    // 3. Determine target index in the global list
    // We want to insert logically into the target category's items.
    // However, `current` is a global list.
    // If we drop into "Uncategorized", we need to find where in "Uncategorized" it fits.
    // And "Uncategorized" items might be scattered in `current` if previous corruption happened,
    // but assuming good state, they are grouped.

    // Simpler approach: 
    // Just iterate all items and find the insertion point as before.
    // BUT we must filter the candidate items to checks against.
    // If we are dropping into "Uncategorized", we should compare Y against items currently in "Uncategorized"?
    // OR we compare Y against ALL items, but `computeDropIndex` already does that.

    // The previous logic for `targetIndex` in `buildDropPreview` was mostly correct for finding WHERE in the shuffled list it goes.
    // The visual order (Y) dictates the new rank.
    // So finding `targetIndex` by simple Y comparison is "okay" IF we assume vertical list.

    let targetIndex = current.length;
    let found = false;

    // Find the first item whose center is below the ghost center
    for (let i = 0; i < current.length; i++) {
        const itemId = current[i];
        if (itemId === snapshot.id) continue;

        const item = items.find(it => it.id === itemId);
        if (!item) continue;

        const itemAbsY = getAbsoluteY(itemId, item.category, layouts, sectionLayouts, bodyLayouts);
        if (itemAbsY === null) continue;

        const itemHeight = layouts[itemId]?.height ?? 0;
        const itemCenterY = itemAbsY + itemHeight / 2;

        if (ghostAbsCenterY < itemCenterY) {
            targetIndex = i;
            found = true;
            break;
        }
    }

    // If we didn't find a target (i.e. we are below everyone), targetIndex is length.

    const draggedIndex = current.indexOf(snapshot.id);
    const categoryChanged = draggedItem.category !== targetCategoryId;

    if (targetIndex === draggedIndex) {
        if (categoryChanged) return { ids: current, changed: true, targetCategoryId };
        return { ids: current, changed: false };
    }

    // Adjust target index if dragging downwards (since removal shifts subsequent items down)
    if (draggedIndex > -1 && draggedIndex < targetIndex) {
        targetIndex -= 1;
    }

    // If adjusted target index brings us back to start (and no category change), exit
    if (targetIndex === draggedIndex) {
        if (categoryChanged) return { ids: current, changed: true, targetCategoryId };
        return { ids: current, changed: false };
    }

    // Move the ID in the list
    const ids = moveItem(current, draggedIndex, targetIndex);

    return { ids, changed: true, targetCategoryId };
};

// Start helper
const getCategoryAtY = (y: number, sectionLayouts: LayoutMap) => {
    let closestCategory: string | null = null;
    let minDistance = Infinity;

    for (const [catId, layout] of Object.entries(sectionLayouts)) {
        const top = layout.y;
        const bottom = layout.y + layout.height;

        // Distance to range [top, bottom]
        // If inside, distance is 0.
        // If outside, distance to nearest edge.
        const dist = y < top ? top - y : y > bottom ? y - bottom : 0;

        if (dist === 0) return catId; // Strict containment optimization

        if (dist < minDistance) {
            minDistance = dist;
            closestCategory = catId;
        }
    }

    return closestCategory;
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

const persistRanks = (orderedIds: string[], items: PackItem[], draggedId: string, targetCategoryId?: string | null) => {
    const updates: RankUpdate[] = [];
    orderedIds.forEach((id, index) => {
        // If this is the dragged item, USE targetCategoryId.
        // If this is NOT the dragged item, USE existing category.

        const original = items.find(i => i.id === id);
        if (!original) return;

        const newRank = buildRank(index, orderedIds.length);
        const isDragged = id === draggedId;
        // Check explicitly for null/undefined because "" is a valid category ID
        const newCategory = (isDragged && targetCategoryId !== undefined && targetCategoryId !== null) ? targetCategoryId : original.category;

        // Only push update if changed
        if (original.rank !== newRank || original.category !== newCategory) {
            updates.push({ id, rank: newRank, category: newCategory });
        }
    });

    if (!updates.length) return;

    const promises = updates.map(update => {
        const original = items.find(i => i.id === update.id);
        if (!original) return Promise.resolve();
        return writeDb.updatePackItem({ ...original, rank: update.rank, category: update.category ?? original.category });
    });
    void Promise.all(promises);
};


const buildRank = (index: number, length: number) => length - index;

const getAbsoluteY = (
    id: string,
    categoryId: string,
    layouts: LayoutMap,
    sectionLayouts: LayoutMap,
    bodyLayouts: LayoutMap,
): number | null => {
    const itemLayout = layouts[id];
    const sectionLayout = sectionLayouts[categoryId];
    const bodyLayout = bodyLayouts[categoryId];
    if (!itemLayout || !sectionLayout || !bodyLayout) return null;
    return sectionLayout.y + bodyLayout.y + itemLayout.y;
};

export const computeDropIndex = (
    orderedIds: string[],
    snapshot: DragSnapshot,
    layouts: LayoutMap,
    sectionLayouts: LayoutMap,
    bodyLayouts: LayoutMap,
    currentCategoryId: string,
): number | null => {
    if (!snapshot) return null;
    const draggedLayout = layouts[snapshot.id];
    if (!draggedLayout) return null; // If we don't know the dragged item size, we can't sort properly

    // 1. Calculate Absolute Ghost Position
    const startAbsY = getAbsoluteY(snapshot.id, snapshot.categoryId, layouts, sectionLayouts, bodyLayouts);
    if (startAbsY === null) return null; // Can't compute start position

    // The ghost is translated by offsetY from its original position
    const ghostAbsY = startAbsY + snapshot.offsetY;
    const ghostAbsCenterY = ghostAbsY + draggedLayout.height / 2;

    // 2. Iterate through items in the current category to find drop index
    // If the category is empty, drop at 0?
    if (orderedIds.length === 0) {
        // Check if cursor is roughly within this empty section?
        // We'd need the section layout.
        const sectionLayout = sectionLayouts[currentCategoryId];
        const bodyLayout = bodyLayouts[currentCategoryId];
        if (sectionLayout && bodyLayout) {
            const sectionAbsY = sectionLayout.y + bodyLayout.y;
            // If cursor is within acceptable range (e.g. +/- 50px of header), we accept.
            // But actually, if we are calling this, we want to know *if* we are over it.
            // But this function is just "computeDropIndex". It assumes we ARE over it?
            // No, "computeDropIndex" is called for EVERY category render.
            // It must decide if the drop target is HERE.

            // Simple heuristic: If ghost is within the vertical bounds of this category section?
            // But Body has 0 height if empty? likely.
            // So we check if ghost is "near" the header.
            const sectionAbsBottom = sectionAbsY + 50; // Arbitrary "drop zone" for empty list
            if (ghostAbsCenterY >= sectionAbsY && ghostAbsCenterY <= sectionAbsBottom) {
                return 0;
            }
        }
        return null;
    }

    // 3. Find insertion point
    // We want to find the first item whose center is below the ghost center.
    // If we find one, the index is that item's index.
    // If we don't find one, the index is length (end).

    let targetIndex = orderedIds.length;

    // Optimization: Check if ghost is wildly outside bounds of this section?
    // First item top
    const firstAbsY = getAbsoluteY(orderedIds[0], currentCategoryId, layouts, sectionLayouts, bodyLayouts);
    // Last item bottom
    const lastId = orderedIds[orderedIds.length - 1];
    const lastAbsY = getAbsoluteY(lastId, currentCategoryId, layouts, sectionLayouts, bodyLayouts);
    const lastHeight = layouts[lastId]?.height ?? 0;

    // Bounds check (optional but good for performance/correctness)
    // If ghost is above the first item by a margin, it's not here (unless it's the very first section? handled by caller?)
    // Actually, we should be careful. If we are dragged WAY above, targetIndex 0 might be returned, 
    // but maybe we are in the Previous Category?

    // Strategy: We compute the "best" index for this category.
    // The UI (DropIndicator) logic in CategorySection determines if we show it.
    // The ordering logic handles the actual move.

    // Wait, if we return index 0 for Category B, and index 5 (end) for Category A, 
    // and Category A is above Category B.
    // If ghost is in between A and B.
    // Both might claim it?
    // We need to resolve which category wins.
    // `computeDropIndex` runs locally.
    // Maybe we should check if ghost is implicitly within the vertical span of this category?
    // Start of section to End of section.

    const currentSectionLayout = sectionLayouts[currentCategoryId];
    // If we can't measure section, we can't be sure, so be conservative.
    if (!currentSectionLayout) return null;

    // Check vertical overlap with the SECTION
    // Section Y is top. Height is full height.
    const sectionTop = currentSectionLayout.y;
    const sectionBottom = sectionTop + currentSectionLayout.height;

    // Allow some slop?
    if (ghostAbsCenterY < sectionTop || ghostAbsCenterY > sectionBottom) {
        return null; // Not in this section
    }

    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const itemAbsY = getAbsoluteY(id, currentCategoryId, layouts, sectionLayouts, bodyLayouts);
        if (itemAbsY === null) continue;
        const itemHeight = layouts[id]?.height ?? 0;
        const itemCenterY = itemAbsY + itemHeight / 2;

        if (ghostAbsCenterY < itemCenterY) {
            targetIndex = i;
            break;
        }
    }

    return targetIndex;
};
