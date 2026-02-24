import { createContext } from "react";

type SubscriptionContextValue = {
  isSubscribed: boolean;
  loading: boolean;
};

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  isSubscribed: false,
  loading: true,
});
