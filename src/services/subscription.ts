import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";

const REVENUECAT_IOS_KEY = "YOUR_REVENUECAT_IOS_API_KEY";
const ENTITLEMENT_ID = "premium";
const WHITELISTED_EMAILS = new Set(["johan.frick@gmail.com"]);

export const isWhitelistedUser = (email: string): boolean => WHITELISTED_EMAILS.has(email);

export const configureRevenueCat = async (userId: string) => {
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  await Purchases.logIn(userId);
};

export const getSubscriptionStatus = async (): Promise<boolean> => {
  const info = await Purchases.getCustomerInfo();
  return isActiveSubscription(info);
};

export const isActiveSubscription = (info: CustomerInfo): boolean =>
  info.entitlements.active[ENTITLEMENT_ID] !== undefined;

export const getOfferings = async (): Promise<PurchasesPackage[]> => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return isActiveSubscription(customerInfo);
};

export const restorePurchases = async (): Promise<boolean> => {
  const info = await Purchases.restorePurchases();
  return isActiveSubscription(info);
};
