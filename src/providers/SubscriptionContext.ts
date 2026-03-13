import { createContext, useContext } from "react";
import type { PurchasesPackage } from "react-native-purchases";

type SubscriptionContextValue = {
  isSubscribed: boolean;
  loading: boolean;
  processing: boolean;
  offerings: PurchasesPackage[];
  error: string | null;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  isSubscribed: false,
  loading: true,
  processing: false,
  offerings: [],
  error: null,
  purchase: async () => undefined,
  restore: async () => undefined,
  refresh: async () => undefined,
});

export const useSubscription = () => useContext(SubscriptionContext);
