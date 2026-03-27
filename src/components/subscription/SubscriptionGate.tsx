import type { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type Props = PropsWithChildren<{ email: string; onSignOut: () => void }>;

export function SubscriptionGate({ email, onSignOut, children }: Props) {
  const {
    isSubscribed,
    loading,
    processing,
    offerings,
    error,
    purchase,
    restore,
  } = useSubscription();

  if (loading) return <SubscriptionLoadingState />;
  if (isSubscribed) return children;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>
          Subscribe with Apple in-app purchases to continue using PackSmarter.
        </Text>
        {offerings.map((pkg) => (
          <PackageRow
            key={pkg.identifier}
            pkg={pkg}
            onPress={() => void purchase(pkg)}
            disabled={processing}
          />
        ))}
        {offerings.length === 0 && (
          <Text style={styles.info}>
            No products available yet. Check RevenueCat offerings setup.
          </Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={styles.secondaryButton}
          onPress={() => void restore()}
          disabled={processing}
        >
          <Text style={styles.secondaryText}>Restore Purchases</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={onSignOut}>
          <Text style={styles.ghostText}>Sign Out ({email})</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SubscriptionLoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={homeColors.primary} />
    </View>
  );
}

const trialLabel = (pkg: PurchasesPackage): string | null => {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  return `${intro.periodNumberOfUnits}-${intro.periodUnit.toLowerCase()} free trial`;
};

type PackageRowProps = {
  pkg: PurchasesPackage;
  onPress: () => void;
  disabled: boolean;
};

function PackageRow({ pkg, onPress, disabled }: PackageRowProps) {
  const trial = trialLabel(pkg);
  return (
    <Pressable
      style={[styles.primaryButton, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.primaryTitle}>{pkg.product.title}</Text>
      <Text style={styles.primaryPrice}>{pkg.product.priceString}</Text>
      {trial && <Text style={styles.trialText}>{trial}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: homeColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: homeSpacing.lg,
    gap: homeSpacing.md,
    justifyContent: "center",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: homeColors.text,
    textAlign: "center",
  },
  subtitle: { fontSize: 16, color: homeColors.muted, textAlign: "center" },
  primaryButton: {
    backgroundColor: homeColors.primary,
    borderRadius: homeRadius,
    padding: homeSpacing.md,
    gap: homeSpacing.xs,
  },
  primaryTitle: {
    color: homeColors.buttonText,
    fontSize: 16,
    fontWeight: "700",
  },
  primaryPrice: {
    color: homeColors.buttonText,
    fontSize: 14,
    fontWeight: "500",
  },
  trialText: {
    color: homeColors.buttonText,
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.85,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: homeRadius,
    padding: homeSpacing.md,
    alignItems: "center",
  },
  secondaryText: { color: homeColors.text, fontSize: 16, fontWeight: "600" },
  ghostButton: { alignItems: "center", padding: homeSpacing.sm },
  ghostText: { color: homeColors.muted, fontSize: 14 },
  info: { color: homeColors.muted, textAlign: "center" },
  error: { color: homeColors.danger, textAlign: "center" },
  disabled: { opacity: 0.6 },
});
