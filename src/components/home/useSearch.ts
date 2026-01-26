import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutRectangle } from "react-native";
import { PackItem } from "~/types/PackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { findMatchingItemIds } from "./filterUtils.ts";

type LayoutMap = Record<string, LayoutRectangle>;

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
  scrollToMatch: (id: string, categoryId: string, layouts: LayoutMap, sectionLayouts: LayoutMap, bodyLayouts: LayoutMap) => void;
  scrollRef: React.RefObject<{ scrollTo: (options: { y: number; animated?: boolean }) => void } | null>;
};

export const useSearch = (items: PackItem[], categories: NamedEntity[]): SearchState => {
  const [searchText, setSearchText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<{ scrollTo: (options: { y: number; animated?: boolean }) => void }>(null);

  const matchedIds = useMemo(() => findMatchingItemIds(items, searchText, categories), [items, searchText, categories]);

  useEffect(() => setCurrentIndex(0), [matchedIds.length]);

  const onSearchChange = useCallback((text: string) => setSearchText(text), []);

  const onNext = useCallback(() => {
    if (matchedIds.length === 0) return;
    setCurrentIndex((i) => (i + 1) % matchedIds.length);
  }, [matchedIds.length]);

  const onPrev = useCallback(() => {
    if (matchedIds.length === 0) return;
    setCurrentIndex((i) => (i - 1 + matchedIds.length) % matchedIds.length);
  }, [matchedIds.length]);

  const onClear = useCallback(() => {
    setSearchText("");
    setCurrentIndex(0);
  }, []);

  const currentMatchId = matchedIds[currentIndex] ?? null;

  const scrollToMatch = useCallback((id: string, categoryId: string, layouts: LayoutMap, sectionLayouts: LayoutMap, bodyLayouts: LayoutMap) => {
    const itemLayout = layouts[id];
    const sectionLayout = sectionLayouts[categoryId];
    const bodyLayout = bodyLayouts[categoryId];
    if (!itemLayout || !sectionLayout || !bodyLayout || !scrollRef.current) return;
    const absoluteY = sectionLayout.y + bodyLayout.y + itemLayout.y;
    scrollRef.current.scrollTo({ y: Math.max(0, absoluteY - 100), animated: true });
  }, []);

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
