import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeColors } from "~/components/home/theme.ts";

export type Tab = "items" | "lists" | "categories" | "members";

type TabConfig = { id: Tab; icon: string; label: string };
const TABS: TabConfig[] = [
  { id: "items", icon: "☑︎", label: "Items" },
  { id: "lists", icon: "☰", label: "Lists" },
  { id: "categories", icon: "▦", label: "Categories" },
  { id: "members", icon: "♡", label: "Members" },
];

type FooterNavProps = { active: Tab; onSelect: (tab: Tab) => void; showItems: boolean };

export const FooterNav = ({ active, onSelect, showItems }: FooterNavProps) => {
  const insets = useSafeAreaInsets();
  const visibleTabs = showItems ? TABS : TABS.filter((t) => t.id !== "items");
  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <BlurView blurType="ultraThinMaterial" blurAmount={20} style={styles.container}>
        {visibleTabs.map((tab) => (
          <Pressable key={tab.id} style={[styles.tab, active === tab.id && styles.tabActive]} onPress={() => onSelect(tab.id)}>
            <Text style={active === tab.id ? styles.iconActive : styles.icon}>{tab.icon}</Text>
            <Text style={active === tab.id ? styles.labelActive : styles.label}>{tab.label}</Text>
          </Pressable>
        ))}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 2,
    borderRadius: 20,
    margin: 4,
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  icon: {
    fontSize: 22,
    color: homeColors.muted,
  },
  iconActive: {
    fontSize: 22,
    color: homeColors.primary,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: homeColors.muted,
  },
  labelActive: {
    fontSize: 10,
    fontWeight: "600",
    color: homeColors.primary,
  },
});
