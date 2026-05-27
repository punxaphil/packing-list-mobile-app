import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import i18next from "i18next";
import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import {
  configureRevenueCat,
  fetchOfferings,
  getCurrentSubscriptionDetails,
  isActiveSubscription,
  openManageSubscriptions,
  purchasePackage,
  restorePurchases,
  type SubscriptionDetails,
  sortPreferredPackages,
} from "~/services/subscription.ts";
import { SubscriptionContext } from "./SubscriptionContext.ts";
import { Platform } from "react-native";

type Props = { userId: string; children: ReactNode };

const INTERNAL_SUBSCRIPTION_ERROR_PATTERNS = [
  /RevenueCat .* API key is missing/i,
  /REVENUECAT_/i,
  /src\/services\/subscription\.ts/i,
];

const toUserErrorMessage = (error: unknown, fallbackKey: string) => {
  if (!(error instanceof Error)) return i18next.t(fallbackKey);
  const message = error.message.trim();
  if (!message) return i18next.t(fallbackKey);
  const isInternalError = INTERNAL_SUBSCRIPTION_ERROR_PATTERNS.some((pattern) => pattern.test(message));
  return isInternalError ? i18next.t("subscription.unavailableError") : message;
};

export const SubscriptionProvider = ({ userId, children }: Props) => {
  if (Platform.OS === "android") {
    // Always treat as subscribed, skip RevenueCat
    return (
      <SubscriptionContext.Provider
        value={{
          details: null,
          isSubscribed: true,
          loading: false,
          processing: false,
          offerings: [],
          error: null,
          purchase: async () => {},
          restore: async () => {},
          refresh: () => {},
          manage: () => {},
        }}
      >
        {children}
      </SubscriptionContext.Provider>
    );
  }

  const initialized = useRef(false);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCustomerInfo = useCallback((info: CustomerInfo) => {
    setDetails(getCurrentSubscriptionDetails(info));
    setIsSubscribed(isActiveSubscription(info));
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const [customerInfo, availablePackages] = await Promise.all([Purchases.getCustomerInfo(), fetchOfferings()]);
    setOfferings(sortPreferredPackages(availablePackages));
    handleCustomerInfo(customerInfo);
  }, [handleCustomerInfo]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    configureRevenueCat(userId)
      .then(refresh)
      .catch((e) => {
        setLoading(false);
        setError(toUserErrorMessage(e, "subscription.initializeError"));
      });

    Purchases.addCustomerInfoUpdateListener(handleCustomerInfo);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfo);
    };
  }, [userId, handleCustomerInfo, refresh]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage) => {
      setProcessing(true);
      setError(null);
      try {
        const active = await purchasePackage(pkg);
        setIsSubscribed(active);
        await refresh();
      } catch (e) {
        setError(toUserErrorMessage(e, "subscription.purchaseError"));
      } finally {
        setProcessing(false);
      }
    },
    [refresh]
  );

  const restore = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      const active = await restorePurchases();
      setIsSubscribed(active);
      await refresh();
    } catch (e) {
      setError(toUserErrorMessage(e, "subscription.restoreError"));
    } finally {
      setProcessing(false);
    }
  }, [refresh]);

  const manage = useCallback(async () => {
    setError(null);
    try {
      await openManageSubscriptions();
    } catch (e) {
      setError(toUserErrorMessage(e, "subscription.manageError"));
    }
  }, []);

  const value = useMemo(
    () => ({
      details,
      isSubscribed,
      loading,
      processing,
      offerings,
      error,
      purchase,
      restore,
      refresh,
      manage,
    }),
    [details, isSubscribed, loading, processing, offerings, error, purchase, restore, refresh, manage]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
