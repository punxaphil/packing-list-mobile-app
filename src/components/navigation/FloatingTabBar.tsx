import { BlurView } from "@react-native-community/blur";
import { Platform, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabBarColors, tabBarMetrics } from "~/components/home/theme.ts";
import { TabItem } from "~/components/navigation/TabItem.tsx";
import { useTabGestures } from "~/components/navigation/useTabGestures.ts";

export type FloatingTabBarProps = {
  state: { index: number; routeNames: string[] };
  navigation: { navigate: (name: string) => void };
  showItems: boolean;
};

const TAB_CONFIG = [
  { name: "index", icon: "☑︎", label: "Items", requiresSelection: true },
  { name: "lists", icon: "☰", label: "Lists", requiresSelection: false },
  { name: "categories", icon: "▦", label: "Categories", requiresSelection: false },
  { name: "members", icon: "♡", label: "Members", requiresSelection: false },
];

export function FloatingTabBar({ state, navigation, showItems }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleTabs = TAB_CONFIG.filter((t) => !t.requiresSelection || showItems);
  const { highlightedIndex, handleTabLayout, combinedGesture } = useTabGestures(visibleTabs, navigation.navigate);

  const renderBlur = () =>
    Platform.OS === "ios" ? (
      <>
        <BlurView style={StyleSheet.absoluteFill} blurType="chromeMaterial" blurAmount={tabBarMetrics.blurAmount} />
        <View style={styles.glossOverlay} />
      </>
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.fallback]} />
    );

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + tabBarMetrics.bottomPadding }]}>
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.container}>
          {renderBlur()}
          <View style={styles.tabRow}>
            {visibleTabs.map((tab, index) => {
              const isActive = state.index === state.routeNames.indexOf(tab.name) && highlightedIndex === null;
              return (
                <View key={tab.name} onLayout={(e) => handleTabLayout(index, e)}>
                  <TabItem icon={tab.icon} label={tab.label} isOn={isActive || highlightedIndex === index} />
                </View>
              );
            })}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", paddingHorizontal: 16 },
  container: {
    borderRadius: tabBarMetrics.borderRadius,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tabBarColors.borderLight,
    shadowColor: tabBarColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: tabBarMetrics.shadowOpacity,
    shadowRadius: tabBarMetrics.shadowRadius,
    elevation: 8,
  },
  glossOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tabBarColors.glossOverlay,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tabBarColors.glossHighlight,
  },
  fallback: { backgroundColor: tabBarColors.androidFallback },
  tabRow: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6 },
});
