import { useEffect, useMemo, useRef } from "react";
import type { PackItem } from "~/types/PackItem.ts";
import { useFlashHighlight } from "../shared/useFlashHighlight.ts";
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
  const highlight = useFlashHighlight();

  useEffect(() => {
    const currentIds = new Set(items.map((item) => item.id));
    const newItem = items.find((item) => !prevItemIds.current.has(item.id));
    prevItemIds.current = currentIds;
    if (newItem) pendingScrollId.current = newItem.id;
  }, [items]);

  useEffect(() => {
    const id = pendingScrollId.current;
    if (!id) return;
    const categoryId = itemCategoryMap[id];
    if (categoryId === undefined) return;
    const itemLayout = drag.layouts[id];
    const sectionLayout = drag.sectionLayouts[categoryId];
    const bodyLayout = drag.bodyLayouts[categoryId];
    if (!itemLayout || !sectionLayout || !bodyLayout) return;
    pendingScrollId.current = null;
    const absoluteY = sectionLayout.y + bodyLayout.y + itemLayout.y;
    search.scrollRef.current?.scrollTo({ y: Math.max(0, absoluteY - SCROLL_PADDING), animated: true });
    setTimeout(() => highlight.flash(id), HIGHLIGHT_DELAY_MS);
  }, [drag.layouts, drag.sectionLayouts, drag.bodyLayouts, itemCategoryMap, search.scrollRef, highlight.flash]);

  useEffect(() => {
    const { currentMatchId, scrollToMatch } = search;
    if (!currentMatchId) return;
    const categoryId = itemCategoryMap[currentMatchId];
    if (categoryId === undefined) return;
    scrollToMatch(currentMatchId, categoryId, drag.layouts, drag.sectionLayouts, drag.bodyLayouts);
  }, [search, itemCategoryMap, drag.layouts, drag.sectionLayouts, drag.bodyLayouts]);

  return highlight;
};
