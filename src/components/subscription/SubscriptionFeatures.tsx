import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeColors, homeSpacing } from "../home/theme.ts";

const FEATURES = [
  "Create unlimited packing lists and items",
  "Share spaces with family and friends",
  "Reuse your best lists with templates",
  "Set due dates with iPhone reminders",
  "Pack and check off items per member",
  "Sync across all your devices",
];

const FeatureRow = ({ label }: { label: string }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name="check-circle-outline" size={18} color={homeColors.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

export const SubscriptionFeatures = () => (
  <View style={styles.container}>
    <Text style={styles.heading}>Packsy lets you:</Text>
    {FEATURES.map((f) => (
      <FeatureRow key={f} label={f} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: homeSpacing.xs },
  heading: { color: homeColors.text, fontSize: 14, fontWeight: "600", marginBottom: homeSpacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm },
  label: { color: homeColors.text, fontSize: 14, flex: 1 },
});
