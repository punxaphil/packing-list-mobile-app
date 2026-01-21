import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useCallback, useState } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View, ViewStyle } from "react-native";

type FadeScrollViewProps = {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const FADE_HEIGHT = 24;
const SCROLL_THRESHOLD = 4;

export const FadeScrollView = ({ children, style, contentContainerStyle, onScroll }: FadeScrollViewProps) => {
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      setShowTopFade(contentOffset.y > SCROLL_THRESHOLD);
      const bottomOffset = contentSize.height - layoutMeasurement.height - contentOffset.y;
      setShowBottomFade(bottomOffset > SCROLL_THRESHOLD);
      onScroll?.(e);
    },
    [onScroll],
  );

  const handleLayout = (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height);

  const handleContentSizeChange = (_w: number, h: number) => setShowBottomFade(h > containerHeight + SCROLL_THRESHOLD);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      {showTopFade && <TopFade />}
      {showBottomFade && <BottomFade />}
    </View>
  );
};

const TopFade = () => (
  <LinearGradient colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]} style={styles.topFade} pointerEvents="none" />
);

const BottomFade = () => (
  <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]} style={styles.bottomFade} pointerEvents="none" />
);

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  scroll: { flex: 1 },
  topFade: { position: "absolute", top: 0, left: 0, right: 0, height: FADE_HEIGHT },
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: FADE_HEIGHT },
});
