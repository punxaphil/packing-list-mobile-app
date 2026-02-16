import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import { configureRevenueCat, isActiveSubscription, isWhitelistedUser } from "~/services/subscription.ts";
import { SubscriptionContext } from "./SubscriptionContext.ts";

type Props = { userId: string; email: string; children: ReactNode };

export const SubscriptionProvider = ({ userId, email, children }: Props) => {
  const whitelisted = isWhitelistedUser(email);
  const [isSubscribed, setIsSubscribed] = useState(whitelisted);
  const [loading, setLoading] = useState(!whitelisted);

  const handleCustomerInfo = useCallback((info: CustomerInfo) => {
    setIsSubscribed(isActiveSubscription(info));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (whitelisted) return;

    configureRevenueCat(userId)
      .then(() => Purchases.getCustomerInfo())
      .then(handleCustomerInfo)
      .catch(() => setLoading(false));

    Purchases.addCustomerInfoUpdateListener(handleCustomerInfo);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfo);
    };
  }, [userId, handleCustomerInfo, whitelisted]);

  const value = useMemo(() => ({ isSubscribed, loading }), [isSubscribed, loading]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
