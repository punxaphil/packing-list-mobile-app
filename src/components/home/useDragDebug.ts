import { useEffect } from "react";
import type { LayoutRectangle } from "react-native";
import type { PackingListSummary } from "./types.ts";

type Snapshot = { id: string; offsetY: number } | null;

type Params = {
  snapshot: Snapshot;
  layouts: Record<string, LayoutRectangle>;
  lists: PackingListSummary[];
};

export const useDragDebug = ({ snapshot, layouts, lists }: Params) => {
  useEffect(() => {
    if (!snapshot) {
      console.log("drag:end");
      return;
    }
    const layout = layouts[snapshot.id];
    const index = lists.findIndex((entry) => entry.id === snapshot.id);
    console.log("drag:update", {
      id: snapshot.id,
      index,
      offsetY: snapshot.offsetY,
      layout,
    });
  }, [snapshot, layouts, lists]);
};
