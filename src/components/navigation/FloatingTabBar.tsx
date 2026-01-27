import { View, StyleSheet, Text, Platform, LayoutChangeEvent } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState } from "react";
import { homeColors } from "~/components/home/theme.ts";

type TabItemProps = { icon: string; label: string; isOn: boolean };
const TabItem = ({ icon, label, isOn }: TabItemProps) => (
  <View style={[tabStyles.tab, isOn && tabStyles.tabActive]}>
    <Text style={[tabStyles.icon, isOn && tabStyles.iconActive]}>{icon}</Text>
    <Text style={[tabStyles.label, isOn && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  tab: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: "rgba(255,255,255,0.85)" },
  icon: { fontSize: 22, color: homeColors.muted },
  iconActive: { color: homeColors.primary },
  label: { fontSize: 10, fontWeight: "500", color: homeColors.muted, marginTop: 2 },
  labelActive: { fontWeight: "600", color: homeColors.primary },
});

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
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);

  const handleTabLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => { const next = [...prev]; next[index] = { x, width }; return next; });
  };

  const findTabAtX = (x: number): number | null => {
    for (let i = 0; i < tabLayouts.length; i++) {
      const tab = tabLayouts[i];
      if (tab && x >= tab.x && x <= tab.x + tab.width) return i;
    }
    return null;
  };

  const navigateToTab = (idx: number | null) => idx !== null && visibleTabs[idx] && navigation.navigate(visibleTabs[idx].name);

  const gesture = Gesture.Pan()
    .onBegin((e) => setHighlightedIndex(findTabAtX(e.x)))
    .onUpdate((e) => setHighlightedIndex(findTabAtX(e.x)))
    .onEnd((e) => { navigateToTab(findTabAtX(e.x)); setHighlightedIndex(null); })
    .onFinalize(() => setHighlightedIndex(null));

  const tap = Gesture.Tap().onEnd((e) => { navigateToTab(findTabAtX(e.x)); setHighlightedIndex(null); });

  const renderBlur = () => Platform.OS === "ios" ? (
    <>
      <BlurView style={StyleSheet.absoluteFill} blurType="ultraThinMaterial" blurAmount={20} />
      <View style={styles.highlight} />
    </>
  ) : <View style={[StyleSheet.absoluteFill, styles.fallback]} />;

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <GestureDetector gesture={Gesture.Race(gesture, tap)}>
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
  container: { borderRadius: 28, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.35)" },
  highlight: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.12)" },
  fallback: { backgroundColor: "#f2f2f7" },
  tabRow: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6 },
});
