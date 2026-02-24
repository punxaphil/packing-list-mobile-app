import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type Props = PropsWithChildren<{ email: string; onSignOut: () => void }>;

export function SubscriptionGate({ email, onSignOut, children }: Props) {
  const { isSubscribed, loading, processing, offerings, error, purchase, restore, presentPaywall } = useSubscription();

  if (isSubscribed) return children;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>Subscribe with Apple in-app purchases to continue using PackSmarter.</Text>
        {loading && <ActivityIndicator size="large" color={homeColors.primary} />}
        {!loading &&
          offerings.map((pkg) => (
            <PackageRow
              key={pkg.identifier}
              title={pkg.product.title}
              price={pkg.product.priceString}
              onPress={() => void purchase(pkg)}
              disabled={processing}
            />
          ))}
        {!loading && offerings.length === 0 && (
          <Text style={styles.info}>No products available yet. Check RevenueCat offerings setup.</Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.primaryButton} onPress={() => void presentPaywall()} disabled={processing}>
          <Text style={styles.primaryTitle}>Open Paywall</Text>
          <Text style={styles.primaryPrice}>Managed by RevenueCat UI</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void restore()} disabled={processing}>
          <Text style={styles.secondaryText}>Restore Purchases</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={onSignOut}>
          <Text style={styles.ghostText}>Sign Out ({email})</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type PackageRowProps = { title: string; price: string; onPress: () => void; disabled: boolean };

function PackageRow({ title, price, onPress, disabled }: PackageRowProps) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.primaryTitle}>{title}</Text>
      <Text style={styles.primaryPrice}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.background },
  content: { padding: homeSpacing.lg, gap: homeSpacing.md, justifyContent: "center", minHeight: "100%" },
  title: { fontSize: 28, fontWeight: "700", color: homeColors.text, textAlign: "center" },
  subtitle: { fontSize: 16, color: homeColors.muted, textAlign: "center" },
  primaryButton: {
    backgroundColor: homeColors.primary,
    borderRadius: homeRadius,
    padding: homeSpacing.md,
    gap: homeSpacing.xs,
  },
  primaryTitle: { color: homeColors.buttonText, fontSize: 16, fontWeight: "700" },
  primaryPrice: { color: homeColors.buttonText, fontSize: 14, fontWeight: "500" },
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
