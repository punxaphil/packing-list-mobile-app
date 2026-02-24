import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";

const REVENUECAT_IOS_KEY = "YOUR_REVENUECAT_IOS_API_KEY";
const ENTITLEMENT_ID = "premium";
const WHITELISTED_EMAILS = new Set(["johan.frick@gmail.com"]);

export const isWhitelistedUser = (email: string): boolean => WHITELISTED_EMAILS.has(email);

const hasRevenueCatKey = () =>
  Boolean(REVENUECAT_IOS_KEY) && !REVENUECAT_IOS_KEY.includes("YOUR_REVENUECAT_IOS_API_KEY");

export const configureRevenueCat = async (userId: string) => {
  if (!hasRevenueCatKey()) {
    throw new Error("RevenueCat iOS API key is missing. Set REVENUECAT_IOS_KEY in src/services/subscription.ts");
  }
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  await Purchases.logIn(userId);
};

export const isActiveSubscription = (info: CustomerInfo): boolean =>
  info.entitlements.active[ENTITLEMENT_ID] !== undefined;

export const fetchOfferings = async (): Promise<PurchasesPackage[]> => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
  const result = await Purchases.purchasePackage(pkg);
  return isActiveSubscription(result.customerInfo);
};

export const restorePurchases = async (): Promise<boolean> => {
  const info = await Purchases.restorePurchases();
  return isActiveSubscription(info);
};
