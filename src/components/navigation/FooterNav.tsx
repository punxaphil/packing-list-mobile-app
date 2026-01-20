import { Pressable, StyleSheet, Text, View } from "react-native";

export type Tab = "home" | "categories" | "members";

type TabConfig = { key: Tab; label: string; icon: string };

const TABS: TabConfig[] = [
  { key: "home", label: "Lists", icon: "📋" },
  { key: "categories", label: "Categories", icon: "🏷" },
  { key: "members", label: "Members", icon: "👥" },
];

type FooterNavProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

export const FooterNav = ({ active, onSelect }: FooterNavProps) => (
  <View style={styles.container}>
    {TABS.map((tab) => (
      <TabButton key={tab.key} config={tab} active={active === tab.key} onPress={() => onSelect(tab.key)} />
    ))}
  </View>
);

type TabButtonProps = {
  config: TabConfig;
  active: boolean;
  onPress: () => void;
};

const TabButton = ({ config, active, onPress }: TabButtonProps) => (
  <Pressable style={styles.tab} onPress={onPress} accessibilityRole="tab">
    <Text style={active ? styles.iconActive : styles.icon}>{config.icon}</Text>
    <Text style={active ? styles.labelActive : styles.label}>{config.label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  icon: {
    fontSize: 20,
    color: "#9ca3af",
  },
  iconActive: {
    fontSize: 20,
    color: "#2563eb",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9ca3af",
  },
  labelActive: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
  },
});
