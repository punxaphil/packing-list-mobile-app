import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { TAB_BAR_HEIGHT } from "~/components/home/theme.ts";

type FlashScrollViewProps = {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export type FadeScrollViewRef = {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
  scrollToEnd: (options?: { animated?: boolean }) => void;
};

const SCROLL_THRESHOLD = 4;

export const FadeScrollView = forwardRef<FadeScrollViewRef, FlashScrollViewProps>(
  ({ children, style, contentContainerStyle, scrollEnabled = true, onScroll }, ref) => {
    const scrollRef = useRef<ScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const isScrollable = containerHeight > 0 && contentHeight > containerHeight + SCROLL_THRESHOLD;

    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (options) => scrollRef.current?.scrollTo(options),
        scrollToEnd: (options) => scrollRef.current?.scrollToEnd(options),
      }),
      []
    );

    useEffect(() => {
      if (isScrollable) setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
    }, [isScrollable]);

    useEffect(() => {
      const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
      const show = Keyboard.addListener(showEvent, (event) => setKeyboardHeight(event.endCoordinates.height));
      const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
      return () => {
        show.remove();
        hide.remove();
      };
    }, []);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => onScroll?.(e), [onScroll]);

    const handleLayout = (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height);

    const handleContentSizeChange = (_w: number, h: number) => setContentHeight(h);

    return (
      <View style={[styles.container, style]} onLayout={handleLayout}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            { paddingBottom: Math.max(TAB_BAR_HEIGHT, keyboardHeight + 16) },
            contentContainerStyle,
          ]}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          scrollEnabled={scrollEnabled}
        >
          {children}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  scroll: { flex: 1 },
});
