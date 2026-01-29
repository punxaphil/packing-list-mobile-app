import { StyleSheet, Text, View } from "react-native";
import { homeColors, tabBarColors, tabBarMetrics } from "~/components/home/theme.ts";

type TabItemProps = { icon: string; label: string; isOn: boolean };

export const TabItem = ({ icon, label, isOn }: TabItemProps) => (
  <View style={[styles.tab, isOn && styles.tabActive]}>
    <Text style={[styles.icon, isOn && styles.iconActive]}>{icon}</Text>
    <Text style={[styles.label, isOn && styles.labelActive]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  tab: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: tabBarMetrics.tabBorderRadius },
  tabActive: { backgroundColor: tabBarColors.activeTabBg },
  icon: { fontSize: 22, color: homeColors.muted, height: 24, lineHeight: 24, textAlign: "center" },
  iconActive: { color: homeColors.primary },
  label: { fontSize: 10, fontWeight: "500", color: homeColors.muted, marginTop: 2 },
  labelActive: { fontWeight: "600", color: homeColors.primary },
});
