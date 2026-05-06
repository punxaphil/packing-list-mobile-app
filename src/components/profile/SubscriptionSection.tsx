import { StyleSheet, Text, View } from "react-native";
import { SubscriptionLegalLinks } from "~/components/subscription/SubscriptionLegalLinks.tsx";
import { SubscriptionPackageRow } from "~/components/subscription/SubscriptionPackageRow.tsx";
import { getAppAccessTrialEndsAt, hasActiveAppAccessTrial } from "~/components/subscription/subscriptionAccess.ts";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";

const COPY = {
  title: "Subscription",
  manage: "Manage in App Store",
  restore: "Restore Purchases",
  loading: "Loading subscription...",
  none: "No active subscription",
  trial: "7-day free access",
  badgeHint: "Subscribe to continue after trial",
  renewalNote:
    "Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your Apple ID Account Settings.",
};

const formatDate = (value: string | number | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const getSubtitle = (details: ReturnType<typeof useSubscription>["details"], trialEndsAt: number | null) => {
  if (details?.isTrial && details.expiresAt) return `Trial ends ${formatDate(details.expiresAt)}`;
  if (details?.willRenew && details.expiresAt) return `Renews ${formatDate(details.expiresAt)}`;
  if (details?.expiresAt) return `Access until ${formatDate(details.expiresAt)}`;
  if (trialEndsAt) return `Ends ${formatDate(trialEndsAt)}`;
  return null;
};

export const SubscriptionSection = () => {
  const { details, loading, manage, offerings, purchase, processing, restore } = useSubscription();
  const trialEndsAt = hasActiveAppAccessTrial() ? getAppAccessTrialEndsAt() : null;
  const onTrial = !details && !!trialEndsAt;
  const title = details?.planName ?? (trialEndsAt ? COPY.trial : COPY.none);
  const subtitle = getSubtitle(details, trialEndsAt);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{COPY.title}</Text>
      {!loading && onTrial && (
        <View style={styles.badgeRow}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeHint}>{COPY.badgeHint}</Text>
        </View>
      )}
      <Text style={styles.status}>{loading ? COPY.loading : title}</Text>
      {!loading && subtitle ? <Text style={styles.detail}>{subtitle}</Text> : null}
      {!loading &&
        onTrial &&
        offerings.map((pkg) => (
          <SubscriptionPackageRow
            key={pkg.identifier}
            pkg={pkg}
            onPress={() => void purchase(pkg)}
            disabled={processing}
          />
        ))}
      {!loading && onTrial ? (
        <>
          <Text style={styles.legalNote}>{COPY.renewalNote}</Text>
          <Button label={COPY.restore} onPress={() => void restore()} disabled={processing} />
          <SubscriptionLegalLinks />
        </>
      ) : null}
      {!loading && details ? <Button label={COPY.manage} icon="open-in-new" onPress={() => void manage()} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeColors.cardBg,
    borderRadius: 16,
    gap: homeSpacing.sm,
    padding: homeSpacing.md,
    width: "100%",
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: homeColors.danger },
  badgeHint: { color: homeColors.danger, fontSize: 11, fontWeight: "600" },
  sectionTitle: { color: homeColors.muted, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  status: { color: homeColors.text, fontSize: 16, fontWeight: "700" },
  detail: { color: homeColors.muted, fontSize: 14 },
  legalNote: { color: homeColors.muted, fontSize: 11 },
});
