import { Pressable, StyleSheet, Text, View } from "react-native";

export type Tab = "items" | "lists" | "categories" | "members";

type FooterNavProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

export const FooterNav = ({ active, onSelect }: FooterNavProps) => (
  <View style={styles.container}>
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
