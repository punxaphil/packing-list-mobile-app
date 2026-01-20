import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { LayoutRectangle } from "react-native";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DragSnapshot } from "../home/useDragState.ts";

type LayoutMap = Record<string, LayoutRectangle>;
type DropHandler = (snapshot: DragSnapshot, layouts: LayoutMap) => void;
type OrderedIdsState = [string[], Dispatch<SetStateAction<string[]>>];

export const useCategoryOrdering = (categories: NamedEntity[]) => {
  const [orderedIds, setOrderedIds] = useOrderedIds(categories);
  const ordered = orderedIds.map((id) => categories.find((c) => c.id === id)).filter((c): c is NamedEntity => Boolean(c));
  const drop = useDropHandler(categories, setOrderedIds);
  return { categories: ordered, drop } as const;
};

const useOrderedIds = (categories: NamedEntity[]): OrderedIdsState => {
  const [orderedIds, setOrderedIds] = useState(() => categories.map((c) => c.id));
  useEffect(() => {
    setOrderedIds((current) => {
      const incoming = categories.map((c) => c.id);
      const filtered = current.filter((id) => incoming.includes(id));
      return [...filtered, ...incoming.filter((id) => !filtered.includes(id))];
    });
  }, [categories]);
  return [orderedIds, setOrderedIds];
};

const useDropHandler = (categories: NamedEntity[], setOrderedIds: OrderedIdsState[1]): DropHandler =>
  useCallback((snapshot, layouts) => {
    if (!snapshot) return;
    setOrderedIds((current) => {
      const preview = buildDropPreview(current, snapshot, layouts);
      if (!preview.changed) return current;
      persistRanks(preview.ids, categories);
      return preview.ids;
    });
  }, [categories, setOrderedIds]);

const buildDropPreview = (current: string[], snapshot: DragSnapshot, layouts: LayoutMap) => {
  if (!snapshot) return { ids: current, changed: false };
  const draggedIndex = current.indexOf(snapshot.id);
  const draggedLayout = layouts[snapshot.id];
  if (draggedIndex < 0 || !draggedLayout) return { ids: current, changed: false };
  const targetIndex = resolveTargetIndex(current, draggedIndex, draggedLayout, snapshot.offsetY, layouts);
  if (targetIndex === draggedIndex) return { ids: current, changed: false };
  const next = [...current];
  const [item] = next.splice(draggedIndex, 1);
  next.splice(targetIndex, 0, item);
  return { ids: next, changed: true };
};

const resolveTargetIndex = (ids: string[], fromIndex: number, layout: LayoutRectangle, offsetY: number, layouts: LayoutMap) => {
  if (!offsetY) return fromIndex;
  let target = fromIndex;
  if (offsetY > 0) {
    const ghostBottom = layout.y + layout.height + offsetY;
    for (let i = fromIndex + 1; i < ids.length; i++) {
      const l = layouts[ids[i]];
      if (l && ghostBottom >= l.y + l.height / 2) target = i;
      else break;
    }
  } else {
    const ghostTop = layout.y + offsetY;
    for (let i = fromIndex - 1; i >= 0; i--) {
      const l = layouts[ids[i]];
      if (l && ghostTop <= l.y + l.height / 2) target = i;
      else break;
    }
  }
  return target;
};

const persistRanks = (orderedIds: string[], categories: NamedEntity[]) => {
  const updates = orderedIds
    .map((id, i) => {
      const match = categories.find((c) => c.id === id);
      return match ? { ...match, rank: orderedIds.length - i } : null;
    })
    .filter((u): u is NamedEntity => Boolean(u));
  if (updates.length) void writeDb.updateCategories(updates);
};

export const computeCategoryDropIndex = (ids: string[], snapshot: DragSnapshot, layouts: LayoutMap): number | null => {
  if (!snapshot) return null;
  const idx = ids.indexOf(snapshot.id);
  const layout = layouts[snapshot.id];
  if (idx < 0 || !layout) return null;
  return resolveTargetIndex(ids, idx, layout, snapshot.offsetY, layouts);
};
