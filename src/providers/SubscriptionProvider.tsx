import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import {
  configureRevenueCat,
  fetchOfferings,
  isActiveSubscription,
  isWhitelistedUser,
  purchasePackage,
  restorePurchases,
} from "~/services/subscription.ts";
import { SubscriptionContext } from "./SubscriptionContext.ts";

type Props = { userId: string; email: string; children: ReactNode };

export const SubscriptionProvider = ({ userId, email, children }: Props) => {
  const whitelisted = isWhitelistedUser(email);
  const [isSubscribed, setIsSubscribed] = useState(whitelisted);
  const [loading, setLoading] = useState(!whitelisted);
  const [processing, setProcessing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCustomerInfo = useCallback((info: CustomerInfo) => {
    setIsSubscribed(isActiveSubscription(info));
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (whitelisted) return;
    const [customerInfo, availablePackages] = await Promise.all([Purchases.getCustomerInfo(), fetchOfferings()]);
    setOfferings(availablePackages);
    handleCustomerInfo(customerInfo);
  }, [handleCustomerInfo, whitelisted]);

  useEffect(() => {
    if (whitelisted) return;

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
  }, [userId, handleCustomerInfo, refresh, whitelisted]);

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

  const value = useMemo(
    () => ({ isSubscribed, loading, processing, offerings, error, purchase, restore, refresh }),
    [isSubscribed, loading, processing, offerings, error, purchase, restore, refresh]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
