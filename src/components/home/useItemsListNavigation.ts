import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PackItem } from "~/types/PackItem.ts";
import { useFlashHighlight } from "../shared/useFlashHighlight.ts";
import type { RowLayout } from "./itemRowProps.ts";
import type { useDragState } from "./useDragState.ts";
import type { SearchState } from "./useSearch.ts";

const SCROLL_PADDING = 100;
const HIGHLIGHT_DELAY_MS = 300;

export const useItemsListNavigation = (
  items: PackItem[],
  search: SearchState,
  drag: ReturnType<typeof useDragState>
) => {
  const itemCategoryMap = useMemo(() => Object.fromEntries(items.map((item) => [item.id, item.category])), [items]);
  const prevItemIds = useRef(new Set(items.map((item) => item.id)));
  const pendingScrollId = useRef<string | null>(null);
  const pendingMove = useRef<{ id: string; categoryId: string } | null>(null);
  const [movedLayout, setMovedLayout] = useState<RowLayout | null>(null);
  const highlight = useFlashHighlight();
  const scrollToMovedItem = useCallback((id: string, categoryId: string) => {
    pendingMove.current = { id, categoryId };
    setMovedLayout(null);
  }, []);
  const recordMovedItemLayout = useCallback((id: string, categoryId: string, layout: RowLayout) => {
    if (pendingMove.current?.id === id && pendingMove.current.categoryId === categoryId) setMovedLayout(layout);
  }, []);

  useEffect(() => {
    const currentIds = new Set(items.map((item) => item.id));
    const newItem = items.find((item) => !prevItemIds.current.has(item.id));
    prevItemIds.current = currentIds;
    if (newItem) pendingScrollId.current = newItem.id;
  }, [items]);

  useEffect(() => {
    const id = pendingScrollId.current;
    const move = pendingMove.current;
    if (!id && !move) return;
    const targetId = move?.id ?? id;
    if (!targetId) return;
    const categoryId = itemCategoryMap[targetId];
    if (categoryId === undefined) return;
    if (move && categoryId !== move.categoryId) return;
    const itemLayout = move ? movedLayout : drag.layouts[targetId];
    const sectionLayout = drag.sectionLayouts[categoryId];
    const bodyLayout = drag.bodyLayouts[categoryId];
    if (!itemLayout || !sectionLayout || !bodyLayout) return;
    pendingScrollId.current = null;
    pendingMove.current = null;
    const absoluteY = sectionLayout.y + bodyLayout.y + itemLayout.y;
    search.scrollRef.current?.scrollTo({ y: Math.max(0, absoluteY - SCROLL_PADDING), animated: true });
    setTimeout(() => highlight.flash(targetId), HIGHLIGHT_DELAY_MS);
  }, [
    drag.layouts,
    drag.sectionLayouts,
    drag.bodyLayouts,
    itemCategoryMap,
    movedLayout,
    search.scrollRef,
    highlight.flash,
  ]);

  useEffect(() => {
    const { currentMatchId, scrollToMatch } = search;
    if (!currentMatchId) return;
    const categoryId = itemCategoryMap[currentMatchId];
    if (categoryId === undefined) return;
    scrollToMatch(currentMatchId, categoryId, drag.layouts, drag.sectionLayouts, drag.bodyLayouts);
  }, [search, itemCategoryMap, drag.layouts, drag.sectionLayouts, drag.bodyLayouts]);

  return { ...highlight, scrollToMovedItem, recordMovedItemLayout };
};
