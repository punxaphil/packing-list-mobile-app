import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeColors } from "~/components/home/theme.ts";

export type Tab = "items" | "lists" | "categories" | "members";

type FooterNavProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

export const FooterNav = ({ active, onSelect }: FooterNavProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
    <Pressable style={styles.tab} onPress={() => onSelect("items")}>
      <Text style={active === "items" ? styles.iconActive : styles.icon}>☑</Text>
      <Text style={active === "items" ? styles.labelActive : styles.label}>Items</Text>
    </Pressable>
    <Pressable style={styles.tab} onPress={() => onSelect("lists")}>
      <Text style={active === "lists" ? styles.iconActive : styles.icon}>📋</Text>
      <Text style={active === "lists" ? styles.labelActive : styles.label}>Lists</Text>
    </Pressable>
    <Pressable style={styles.tab} onPress={() => onSelect("categories")}>
      <Text style={active === "categories" ? styles.iconActive : styles.icon}>🏷</Text>
      <Text style={active === "categories" ? styles.labelActive : styles.label}>Categories</Text>
    </Pressable>
    <Pressable style={styles.tab} onPress={() => onSelect("members")}>
      <Text style={active === "members" ? styles.iconActive : styles.icon}>👥</Text>
      <Text style={active === "members" ? styles.labelActive : styles.label}>Members</Text>
    </Pressable>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: homeColors.border,
    backgroundColor: homeColors.surface,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 0,
  },
  icon: {
    fontSize: 20,
    color: homeColors.muted,
  },
  iconActive: {
    fontSize: 20,
    color: homeColors.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: homeColors.muted,
  },
  labelActive: {
    fontSize: 11,
    fontWeight: "600",
    color: homeColors.primary,
  },
});
