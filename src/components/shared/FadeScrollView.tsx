import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { TAB_BAR_HEIGHT } from "~/components/home/theme.ts";

type FlashScrollViewProps = {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export type FadeScrollViewRef = {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
};

const SCROLL_THRESHOLD = 4;

export const FadeScrollView = forwardRef<FadeScrollViewRef, FlashScrollViewProps>(({ children, style, contentContainerStyle, onScroll }, ref) => {
  const scrollRef = useRef<ScrollView>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const isScrollable = containerHeight > 0 && contentHeight > containerHeight + SCROLL_THRESHOLD;

  useImperativeHandle(ref, () => ({
    scrollTo: (options) => scrollRef.current?.scrollTo(options),
  }), []);

  useEffect(() => {
    if (isScrollable) setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
  }, [isScrollable]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => onScroll?.(e),
    [onScroll],
  );

  const handleLayout = (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height);

  const handleContentSizeChange = (_w: number, h: number) => setContentHeight(h);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[{ paddingBottom: TAB_BAR_HEIGHT }, contentContainerStyle]}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  scroll: { flex: 1 },
});
