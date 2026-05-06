import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Props = { userId: string; children: ReactNode };

export const SubscriptionProvider = ({ userId, children }: Props) => {
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
        setError(e instanceof Error ? e.message : "Unable to initialize subscriptions");
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
        setError(e instanceof Error ? e.message : "Purchase failed");
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
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setProcessing(false);
    }
  }, [refresh]);

  const manage = useCallback(async () => {
    setError(null);
    try {
      await openManageSubscriptions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open subscription settings");
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
