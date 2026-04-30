import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "~/components/shared/Button.tsx";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SubscriptionPackageRow } from "./SubscriptionPackageRow.tsx";

type Props = { email: string; onSignOut: () => void };

export function SubscriptionGate({ email, onSignOut }: Props) {
  const { processing, offerings, error, purchase, restore } = useSubscription();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>Packsy is free for your first 7 days.</Text>
        <Text style={styles.info}>
          Start a subscription after that to keep using the app. Any Apple trial details are shown before purchase.
        </Text>
        {offerings.map((pkg) => (
          <SubscriptionPackageRow
            key={pkg.identifier}
            pkg={pkg}
            onPress={() => void purchase(pkg)}
            disabled={processing}
          />
        ))}
        {offerings.length === 0 && (
          <Text style={styles.info}>No products available yet. Check RevenueCat offerings setup.</Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label="Restore Purchases" onPress={() => void restore()} disabled={processing} />
        <Button variant="ghost" label={`Sign Out (${email})`} onPress={onSignOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.background },
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
  info: { color: homeColors.muted, textAlign: "center" },
  error: { color: homeColors.danger, textAlign: "center" },
});
