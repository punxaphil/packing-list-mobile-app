import { type RefObject, useEffect } from "react";
import type { ScrollView } from "react-native";
import type { useDragState } from "../home/useDragState.ts";

type Drag = Pick<ReturnType<typeof useDragState>, "snapshot" | "pointerY" | "scrollBy">;

const EDGE_SIZE = 64;
const MAX_SCROLL_STEP = 18;

export const useDragEdgeScroll = (scrollRef: RefObject<ScrollView | null>, drag?: Drag) => {
  const activeId = drag?.snapshot?.id;
  const pointerY = drag?.pointerY;
  const scrollBy = drag?.scrollBy;

  useEffect(() => {
    if (!activeId || !pointerY || !scrollBy) return;
    let frame: number;
    const scroll = () => {
      const node = scrollRef.current?.getScrollableNode() as HTMLElement | undefined;
      const pointer = pointerY.current;
      if (node && pointer !== null) {
        const bounds = node.getBoundingClientRect();
        const top = pointer - bounds.top;
        const bottom = bounds.bottom - pointer;
        const direction = top < EDGE_SIZE ? -1 : bottom < EDGE_SIZE ? 1 : 0;
        const proximity = direction < 0 ? top : bottom;
        const speed = direction * MAX_SCROLL_STEP * (1 - Math.max(0, proximity) / EDGE_SIZE);
        const previous = node.scrollTop;
        node.scrollTop = Math.max(0, Math.min(node.scrollHeight - node.clientHeight, previous + speed));
        if (node.scrollTop !== previous) scrollBy(node.scrollTop - previous);
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [activeId, pointerY, scrollBy, scrollRef]);
};
