import { useCallback, useRef, useState } from "react";
import type { RowLayout } from "./itemRowProps.ts";
import { DragOffset } from "./useDraggableRow.tsx";
import { useDragLayouts } from "./useDragLayouts.ts";

export type DragSnapshot = {
  id: string;
  categoryId: string;
  offsetY: number;
  frozenY?: number;
} | null;

export const useDragState = () => {
  const [snapshot, setSnapshotState] = useState<DragSnapshot>(null);
  const snapshotRef = useRef<DragSnapshot>(null);
  const pointerY = useRef<number | null>(null);
  const translationY = useRef(0);
  const scrollDistance = useRef(0);
  const dragLayouts = useDragLayouts();

  // Sync ref with state synchronously
  const setSnapshot = useCallback((value: DragSnapshot | ((prev: DragSnapshot) => DragSnapshot)) => {
    const next = typeof value === "function" ? value(snapshotRef.current) : value;
    snapshotRef.current = next;
    setSnapshotState(next);
  }, []);

  const start = useCallback(
    (id: string, categoryId: string) => {
      pointerY.current = null;
      translationY.current = 0;
      scrollDistance.current = 0;
      setSnapshot({ id, categoryId, offsetY: 0 });
    },
    [setSnapshot]
  );

  const move = useCallback(
    (id: string, offset: DragOffset) => {
      pointerY.current = offset.absoluteY;
      translationY.current = offset.y;
      const offsetY = offset.y + scrollDistance.current;
      setSnapshot((current) => (current && current.id === id ? { ...current, offsetY } : current));
    },
    [setSnapshot]
  );

  const scrollBy = useCallback(
    (distance: number) => {
      scrollDistance.current += distance;
      const offsetY = translationY.current + scrollDistance.current;
      setSnapshot((current) => (current ? { ...current, offsetY } : current));
    },
    [setSnapshot]
  );

  const end = useCallback(
    (onComplete?: (value: DragSnapshot) => void, layouts?: Record<string, RowLayout>) => {
      // Read from ref to avoid dependency on 'snapshot' state which would break memoization
      const current = snapshotRef.current;
      pointerY.current = null;

      // Freeze the Y position FIRST, before triggering reorder, to prevent jump
      if (current && layouts) {
        const layout = layouts[current.id];
        if (layout) {
          const frozen = { ...current, frozenY: layout.y + current.offsetY };
          snapshotRef.current = frozen;
          setSnapshot(frozen);
        }
      }

      // Defer the reorder to next frame so frozenY renders first
      requestAnimationFrame(() => {
        if (onComplete && current) onComplete(current);

        // Defer clearing snapshot to allow the order update to render
        requestAnimationFrame(() => {
          setSnapshot(null);
        });
      });
    },
    [setSnapshot]
  );

  return {
    snapshot,
    pointerY,
    scrollBy,
    ...dragLayouts,
    start,
    move,
    end,
  } as const;
};
