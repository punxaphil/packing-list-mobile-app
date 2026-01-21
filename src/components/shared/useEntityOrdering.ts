import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { LayoutRectangle } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DragSnapshot } from "../home/useDragState.ts";

type LayoutMap = Record<string, LayoutRectangle>;
type DropHandler = (snapshot: DragSnapshot, layouts: LayoutMap) => void;
type OrderedIdsState = [string[], Dispatch<SetStateAction<string[]>>];
type PersistFn = (updates: NamedEntity[]) => Promise<void>;

export const useEntityOrdering = (entities: NamedEntity[], persist: PersistFn) => {
  const [orderedIds, setOrderedIds] = useOrderedIds(entities);
  const ordered = orderedIds.map((id) => entities.find((e) => e.id === id)).filter((e): e is NamedEntity => Boolean(e));
  const drop = useDropHandler(entities, setOrderedIds, persist);
  return { entities: ordered, drop } as const;
};

const useOrderedIds = (entities: NamedEntity[]): OrderedIdsState => {
  const [orderedIds, setOrderedIds] = useState(() => entities.map((e) => e.id));
  useEffect(() => {
    setOrderedIds((current) => {
      const incoming = entities.map((e) => e.id);
      const filtered = current.filter((id) => incoming.includes(id));
      return [...filtered, ...incoming.filter((id) => !filtered.includes(id))];
    });
  }, [entities]);
  return [orderedIds, setOrderedIds];
};

const useDropHandler = (entities: NamedEntity[], setOrderedIds: OrderedIdsState[1], persist: PersistFn): DropHandler =>
  useCallback((snapshot, layouts) => {
    if (!snapshot) return;
    setOrderedIds((current) => {
      const preview = buildDropPreview(current, snapshot, layouts);
      if (!preview.changed) return current;
      persistRanks(preview.ids, entities, persist);
      return preview.ids;
    });
  }, [entities, setOrderedIds, persist]);

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

const persistRanks = (orderedIds: string[], entities: NamedEntity[], persist: PersistFn) => {
  const updates = orderedIds
    .map((id, i) => {
      const match = entities.find((e) => e.id === id);
      return match ? { ...match, rank: orderedIds.length - i } : null;
    })
    .filter((u): u is NamedEntity => Boolean(u));
  if (updates.length) void persist(updates);
};

export const computeEntityDropIndex = (ids: string[], snapshot: DragSnapshot, layouts: LayoutMap): number | null => {
  if (!snapshot) return null;
  const idx = ids.indexOf(snapshot.id);
  const layout = layouts[snapshot.id];
  if (idx < 0 || !layout) return null;
  return resolveTargetIndex(ids, idx, layout, snapshot.offsetY, layouts);
};
