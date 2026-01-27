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
  useCallback(
    (snapshot, layouts, sectionLayouts, bodyLayouts) => {
      if (!snapshot) return;
      const preview = buildDropPreview(orderedIds, snapshot, layouts, sectionLayouts, bodyLayouts, items);
      if (!preview.changed) return;

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOrderedIds(preview.ids);
      persistRanks(preview.ids, items, snapshot.id, preview.targetCategoryId);
    },
    [orderedIds, items, setOrderedIds]
  );

const buildOrderedItems = (orderedIds: string[], items: PackItem[]) =>
  orderedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is PackItem => Boolean(item));

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
  const draggedItem = items.find((item) => item.id === snapshot.id);
  if (!draggedItem) return { ids: current, changed: false };

  const startAbsY = getAbsoluteY(snapshot.id, draggedItem.category, layouts, sectionLayouts, bodyLayouts);
  if (startAbsY === null) return { ids: current, changed: false };

  const draggedLayout = layouts[snapshot.id];
  if (!draggedLayout) return { ids: current, changed: false };

  const ghostAbsY = startAbsY + snapshot.offsetY;
  const ghostAbsCenterY = ghostAbsY + draggedLayout.height / 2;

  // 2. Determine target category from drop position
  // Only change category if ghost is clearly within another category's BODY area
  // This prevents accidental category changes when dragging near boundaries
  const targetCategoryId = getCategoryAtY(ghostAbsCenterY, sectionLayouts, bodyLayouts, draggedItem.category);

  if (targetCategoryId === null) {
    return { ids: current, changed: false };
  }

  // 3. Determine target index within the target category
  // Build a list of items in the target category sorted by their visual Y position
  const visualOrder = current
    .filter((id) => id !== snapshot.id)
    .map((id) => {
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      // Only include items from the target category
      if (item.category !== targetCategoryId) return null;
      const absY = getAbsoluteY(id, item.category, layouts, sectionLayouts, bodyLayouts);
      if (absY === null) return null;
      const height = layouts[id]?.height ?? 0;
      return { id, centerY: absY + height / 2 };
    })
    .filter((entry): entry is { id: string; centerY: number } => entry !== null)
    .sort((a, b) => a.centerY - b.centerY);

  // Find insertion point based on visual position
  let insertAfterId: string | null = null;
  for (const entry of visualOrder) {
    if (ghostAbsCenterY > entry.centerY) {
      insertAfterId = entry.id;
    } else {
      break;
    }
  }

  // Build new order: find where to insert in current array
  const draggedIndex = current.indexOf(snapshot.id);
  let targetIndex: number;

  if (insertAfterId === null) {
    targetIndex = visualOrder.length > 0 ? current.indexOf(visualOrder[0].id) : 0;
  } else {
    targetIndex = current.indexOf(insertAfterId) + 1;
  }
  const categoryChanged = draggedItem.category !== targetCategoryId;

  if (targetIndex === draggedIndex) {
    if (categoryChanged) return { ids: current, changed: true, targetCategoryId };
    return { ids: current, changed: false };
  }

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
const getCategoryAtY = (y: number, sectionLayouts: LayoutMap, bodyLayouts: LayoutMap, sourceCategoryId: string) => {
  // First, check if ghost is still within the SOURCE category's SECTION bounds
  // This prevents accidental category changes when reordering within the same category
  const sourceSection = sectionLayouts[sourceCategoryId];
  if (sourceSection) {
    const sourceTop = sourceSection.y;
    const sourceBottom = sourceSection.y + sourceSection.height;
    if (y >= sourceTop && y <= sourceBottom) {
      return sourceCategoryId;
    }
  }

  // Ghost has left source category bounds - check other categories' BODY areas
  for (const [catId, sectionLayout] of Object.entries(sectionLayouts)) {
    if (catId === sourceCategoryId) continue;

    const bodyLayout = bodyLayouts[catId];
    if (!bodyLayout) continue;

    const bodyTop = sectionLayout.y + bodyLayout.y;
    const bodyBottom = bodyTop + bodyLayout.height;

    if (y >= bodyTop && y <= bodyBottom) {
      return catId;
    }
  }

  return sourceCategoryId;
};

const _resolveTargetIndex = (
  ids: string[],
  fromIndex: number,
  draggedLayout: LayoutRectangle,
  offsetY: number,
  layouts: LayoutMap
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
  layouts: LayoutMap
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
  layouts: LayoutMap
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

    const original = items.find((i) => i.id === id);
    if (!original) return;

    const newRank = buildRank(index, orderedIds.length);
    const isDragged = id === draggedId;
    // Check explicitly for null/undefined because "" is a valid category ID
    const newCategory =
      isDragged && targetCategoryId !== undefined && targetCategoryId !== null ? targetCategoryId : original.category;

    // Only push update if changed
    if (original.rank !== newRank || original.category !== newCategory) {
      updates.push({ id, rank: newRank, category: newCategory });
    }
  });

  if (!updates.length) return;

  const batch = writeDb.initBatch();
  for (const update of updates) {
    const original = items.find((i) => i.id === update.id);
    if (!original) continue;
    writeDb.updatePackItemBatch(
      { ...original, rank: update.rank, category: update.category ?? original.category },
      batch
    );
  }
  void batch.commit();
};

const buildRank = (index: number, length: number) => length - index;

const getAbsoluteY = (
  id: string,
  categoryId: string,
  layouts: LayoutMap,
  sectionLayouts: LayoutMap,
  bodyLayouts: LayoutMap
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
  currentCategoryId: string
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
  const _firstAbsY = getAbsoluteY(orderedIds[0], currentCategoryId, layouts, sectionLayouts, bodyLayouts);
  // Last item bottom
  const lastId = orderedIds[orderedIds.length - 1];
  const _lastAbsY = getAbsoluteY(lastId, currentCategoryId, layouts, sectionLayouts, bodyLayouts);
  const _lastHeight = layouts[lastId]?.height ?? 0;

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
