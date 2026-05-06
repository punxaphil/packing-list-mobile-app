import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "~/components/shared/Button.tsx";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SubscriptionLegalLinks } from "./SubscriptionLegalLinks.tsx";
import { SubscriptionPackageRow } from "./SubscriptionPackageRow.tsx";

type Props = { email: string; onSignOut: () => void };

const COPY = {
  title: "Unlock Premium",
  subtitle: "Packsy is free for your first 7 days.",
  info: "Start a subscription after that to keep using the app. Any Apple trial details are shown before purchase.",
  renewalNote:
    "Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your Apple ID Account Settings.",
  restore: "Restore Purchases",
  signOut: (email: string) => `Sign Out (${email})`,
};

export function SubscriptionGate({ email, onSignOut }: Props) {
  const { processing, offerings, error, purchase, restore } = useSubscription();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{COPY.title}</Text>
        <Text style={styles.subtitle}>{COPY.subtitle}</Text>
        <Text style={styles.info}>{COPY.info}</Text>
        {offerings.map((pkg) => (
          <SubscriptionPackageRow
            key={pkg.identifier}
            pkg={pkg}
            onPress={() => void purchase(pkg)}
            disabled={processing}
          />
        ))}
        {offerings.length === 0 && <Text style={styles.info}>{COPY.info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.legalNote}>{COPY.renewalNote}</Text>
        <Button label={COPY.restore} onPress={() => void restore()} disabled={processing} />
        <SubscriptionLegalLinks />
        <Button variant="ghost" label={COPY.signOut(email)} onPress={onSignOut} />
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
