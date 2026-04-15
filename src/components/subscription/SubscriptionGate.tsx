import i18next from "i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "~/components/shared/Button.tsx";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SubscriptionFeatures } from "./SubscriptionFeatures.tsx";
import { SubscriptionLegalLinks } from "./SubscriptionLegalLinks.tsx";
import { SubscriptionPackageRow } from "./SubscriptionPackageRow.tsx";
import { subscriptionCopy } from "./subscriptionCopy.ts";

type Props = { email: string; onSignOut: () => void };

export function SubscriptionGate({ email, onSignOut }: Props) {
  const { processing, offerings, error, purchase, restore } = useSubscription();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{subscriptionCopy.title}</Text>
        <Text style={styles.subtitle}>{subscriptionCopy.subtitle}</Text>
        <SubscriptionFeatures />
        <Text style={styles.info}>{subscriptionCopy.info}</Text>
        {offerings.map((pkg) => (
          <SubscriptionPackageRow
            key={pkg.identifier}
            pkg={pkg}
            onPress={() => void purchase(pkg)}
            disabled={processing}
          />
        ))}
        {offerings.length === 0 && <Text style={styles.info}>{subscriptionCopy.noOfferings}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.legalNote}>{subscriptionCopy.renewalNote}</Text>
        <Button label={subscriptionCopy.restorePurchases} onPress={() => void restore()} disabled={processing} />
        <SubscriptionLegalLinks />
        <Button variant="ghost" label={i18next.t("subscription.signOut", { email })} onPress={onSignOut} />
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
  legalNote: { color: homeColors.muted, fontSize: 11, textAlign: "center" },
  error: { color: homeColors.danger, textAlign: "center" },
});
