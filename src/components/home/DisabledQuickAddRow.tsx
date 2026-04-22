import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

const DISABLED_COLOR = homeColors.border;

export const DisabledQuickAddRow = () => (
  <View style={styles.row}>
    <View style={homeStyles.quickAdd}>
      <Text style={styles.label}>{HOME_COPY.addItemQuick}</Text>
    </View>
    <View style={styles.iconRow}>
      <View style={styles.iconButton}>
        <MaterialCommunityIcons name="information-outline" size={20} color={DISABLED_COLOR} />
      </View>
      <View style={styles.iconButton}>
        <MaterialCommunityIcons name="magnify" size={20} color={DISABLED_COLOR} />
      </View>
      <View style={styles.iconButton}>
        <MaterialCommunityIcons name="filter-variant" size={20} color={DISABLED_COLOR} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  iconButton: { padding: homeSpacing.xs },
  label: { fontSize: 14, fontWeight: "500", color: DISABLED_COLOR },
});
