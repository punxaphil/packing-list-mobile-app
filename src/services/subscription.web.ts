/**
 * Web implementation of subscription services.
 * On web, subscriptions are disabled—all users have free access.
 */

export type SubscriptionDetails = {
  productIdentifier: string;
  planName: string;
  expiresAt: string | null;
  isTrial: boolean;
  willRenew: boolean;
};

export const configureRevenueCat = async (_userId: string) => {};

export const isActiveSubscription = () => false;

export const getCurrentSubscriptionDetails = () => null;

export const fetchOfferings = async () => {
  return [];
};

export const sortPreferredPackages = (packages: never[]) => packages;

export const purchasePackage = async () => {
  throw new Error("Subscriptions are not available on web");
};

export const restorePurchases = async () => {
  throw new Error("Subscriptions are not available on web");
};

export const openManageSubscriptions = async () => {
  throw new Error("Subscriptions are not available on web");
};
