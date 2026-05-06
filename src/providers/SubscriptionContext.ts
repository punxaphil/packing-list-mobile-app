import { createContext, useContext } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { SubscriptionDetails } from "~/services/subscription.ts";

type SubscriptionContextValue = {
  details: SubscriptionDetails | null;
  isSubscribed: boolean;
  loading: boolean;
  processing: boolean;
  offerings: PurchasesPackage[];
  error: string | null;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
  manage: () => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  details: null,
  isSubscribed: false,
  loading: true,
  processing: false,
  offerings: [],
  error: null,
  purchase: async () => undefined,
  restore: async () => undefined,
  refresh: async () => undefined,
  manage: async () => undefined,
});

export const useSubscription = () => useContext(SubscriptionContext);
