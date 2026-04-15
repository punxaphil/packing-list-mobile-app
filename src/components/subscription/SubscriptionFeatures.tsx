import i18next from "i18next";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { subscriptionCopy } from "./subscriptionCopy.ts";

const FeatureRow = ({ label }: { label: string }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name="check-circle-outline" size={18} color={homeColors.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

export const SubscriptionFeatures = () => {
  const features = i18next.t("subscription.features", { returnObjects: true }) as string[];
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{subscriptionCopy.featuresHeading}</Text>
      {features.map((f) => (
        <FeatureRow key={f} label={f} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: homeSpacing.xs },
  heading: { color: homeColors.text, fontSize: 14, fontWeight: "600", marginBottom: homeSpacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm },
  label: { color: homeColors.text, fontSize: 14, flex: 1 },
});
