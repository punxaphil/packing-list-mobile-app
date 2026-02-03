import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutRectangle } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { findMatchingItemIds } from "./filterUtils.ts";
import { SEARCH_BAR_HEIGHT, TOP_BAR_HEIGHT } from "./theme.ts";

type LayoutMap = Record<string, LayoutRectangle>;
type ScrollRef = React.RefObject<{ scrollTo: (options: { y: number; animated?: boolean }) => void } | null>;

export type SearchState = {
  searchText: string;
  matchedIds: string[];
  currentIndex: number;
  totalMatches: number;
  onSearchChange: (text: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
  currentMatchId: string | null;
  scrollToMatch: (
    id: string,
    categoryId: string,
    layouts: LayoutMap,
    sectionLayouts: LayoutMap,
    bodyLayouts: LayoutMap
  ) => void;
  scrollRef: ScrollRef;
};

export const useSearch = (items: PackItem[], categories: NamedEntity[], externalSearchText?: string): SearchState => {
  const [internalSearchText, setInternalSearchText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<{ scrollTo: (options: { y: number; animated?: boolean }) => void }>(null);

  const searchText = externalSearchText ?? internalSearchText;
  const matchedIds = useMemo(() => findMatchingItemIds(items, searchText, categories), [items, searchText, categories]);
  const matchCount = matchedIds.length;

  useEffect(() => {
    if (matchCount >= 0) setCurrentIndex(0);
  }, [matchCount]);

  const onSearchChange = useCallback((text: string) => setInternalSearchText(text), []);

  const onNext = useCallback(() => {
    if (matchedIds.length === 0) return;
    setCurrentIndex((i) => (i + 1) % matchedIds.length);
  }, [matchedIds.length]);

  const onPrev = useCallback(() => {
    if (matchedIds.length === 0) return;
    setCurrentIndex((i) => (i - 1 + matchedIds.length) % matchedIds.length);
  }, [matchedIds.length]);

  const onClear = useCallback(() => {
    setInternalSearchText("");
    setCurrentIndex(0);
  }, []);

  const currentMatchId = matchedIds[currentIndex] ?? null;

  const scrollToMatch = useCallback(
    (id: string, categoryId: string, layouts: LayoutMap, sectionLayouts: LayoutMap, bodyLayouts: LayoutMap) => {
      const itemLayout = layouts[id];
      const sectionLayout = sectionLayouts[categoryId];
      const bodyLayout = bodyLayouts[categoryId];
      if (!itemLayout || !sectionLayout || !bodyLayout || !scrollRef.current) return;
      const absoluteY = sectionLayout.y + bodyLayout.y + itemLayout.y;
      const extraOffset = 12;
      scrollRef.current.scrollTo({ y: absoluteY - TOP_BAR_HEIGHT - SEARCH_BAR_HEIGHT - extraOffset, animated: true });
    },
    []
  );

  return {
    searchText,
    matchedIds,
    currentIndex,
    totalMatches: matchedIds.length,
    onSearchChange,
    onNext,
    onPrev,
    onClear,
    currentMatchId,
    scrollToMatch,
    scrollRef,
  };
};
