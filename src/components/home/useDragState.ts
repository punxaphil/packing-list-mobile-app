import { useCallback, useRef, useState } from "react";
import { LayoutRectangle } from "react-native";
import { DragOffset } from "./useDraggableRow.tsx";

export type DragSnapshot = { id: string; categoryId: string; offsetY: number; frozenY?: number } | null;

export const useDragState = () => {
  const [snapshot, setSnapshotState] = useState<DragSnapshot>(null);
  const snapshotRef = useRef<DragSnapshot>(null);

  // Sync ref with state synchronously
  const setSnapshot = useCallback((value: DragSnapshot | ((prev: DragSnapshot) => DragSnapshot)) => {
    setSnapshotState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      snapshotRef.current = next;
      return next;
    });
  }, []);

  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, LayoutRectangle>>({});
  const [bodyLayouts, setBodyLayouts] = useState<Record<string, LayoutRectangle>>({});

  const recordLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordSectionLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setSectionLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordBodyLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setBodyLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const start = useCallback(
    (id: string, categoryId: string) => setSnapshot({ id, categoryId, offsetY: 0 }),
    [setSnapshot]
  );

  const move = useCallback(
    (id: string, offset: DragOffset) => {
      setSnapshot((current) => (current && current.id === id ? { ...current, offsetY: offset.y } : current));
    },
    [setSnapshot]
  );

  const end = useCallback(
    (onComplete?: (value: DragSnapshot) => void, layouts?: Record<string, LayoutRectangle>) => {
      // Read from ref to avoid dependency on 'snapshot' state which would break memoization
      const current = snapshotRef.current;

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
    layouts,
    sectionLayouts,
    bodyLayouts,
    recordLayout,
    recordSectionLayout,
    recordBodyLayout,
    start,
    move,
    end,
  } as const;
};
