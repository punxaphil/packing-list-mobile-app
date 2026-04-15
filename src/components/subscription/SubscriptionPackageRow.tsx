import i18next from "i18next";
import { Pressable, StyleSheet, Text } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type Props = {
  pkg: PurchasesPackage;
  onPress: () => void;
  disabled: boolean;
};

const trialLabel = (pkg: PurchasesPackage): string | null => {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  return i18next.t("subscription.freeTrialLabel", {
    count: intro.periodNumberOfUnits,
    unit: intro.periodUnit.toLowerCase(),
  });
};

export function SubscriptionPackageRow({ pkg, onPress, disabled }: Props) {
  const trial = trialLabel(pkg);
  return (
    <Pressable style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.title}>{pkg.product.title}</Text>
      <Text style={styles.price}>{pkg.product.priceString}</Text>
      {trial && <Text style={styles.trial}>{trial}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: homeColors.primary,
    borderRadius: homeRadius,
    padding: homeSpacing.md,
    gap: homeSpacing.xs,
  },
  title: {
    color: homeColors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    color: homeColors.primaryForeground,
    fontSize: 14,
    fontWeight: "500",
  },
  trial: {
    color: homeColors.primaryForeground,
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.85,
  },
  disabled: { opacity: 0.6 },
});
