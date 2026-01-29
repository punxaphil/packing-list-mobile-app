import { useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { ComposedGesture, Gesture } from "react-native-gesture-handler";

type TabLayout = { x: number; width: number };

export function useTabGestures(visibleTabs: { name: string }[], navigate: (name: string) => void) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [tabLayouts, setTabLayouts] = useState<TabLayout[]>([]);

  const handleTabLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  };

  const findTabAtX = (x: number): number | null => {
    for (let i = 0; i < tabLayouts.length; i++) {
      const tab = tabLayouts[i];
      if (tab && x >= tab.x && x <= tab.x + tab.width) return i;
    }
    return null;
  };

  const navigateToTab = (idx: number | null) => idx !== null && visibleTabs[idx] && navigate(visibleTabs[idx].name);

  const panGesture = Gesture.Pan()
    .onBegin((e) => setHighlightedIndex(findTabAtX(e.x)))
    .onUpdate((e) => setHighlightedIndex(findTabAtX(e.x)))
    .onEnd((e) => {
      navigateToTab(findTabAtX(e.x));
      setHighlightedIndex(null);
    })
    .onFinalize(() => setHighlightedIndex(null));

  const tapGesture = Gesture.Tap().onEnd((e) => {
    navigateToTab(findTabAtX(e.x));
    setHighlightedIndex(null);
  });

  const combinedGesture: ComposedGesture = Gesture.Race(panGesture, tapGesture);

  return { highlightedIndex, handleTabLayout, combinedGesture };
}
