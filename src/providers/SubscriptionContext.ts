import { createContext, useContext } from "react";

type SubscriptionContextValue = {
  isSubscribed: boolean;
  loading: boolean;
};

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  isSubscribed: false,
  loading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);
