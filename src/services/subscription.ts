import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";

const REVENUECAT_IOS_KEY = "appl_MAycwXxDDcWiytfvDCHGUZVkGRR";
const ENTITLEMENT_ID = "entitlement-1";
const MONTHLY_PACKAGE_ID = "monthly";
const YEARLY_PACKAGE_ID = "yearly";

type PlanName = "Monthly" | "Yearly" | "Subscription";

export type SubscriptionDetails = {
  productIdentifier: string;
  planName: PlanName;
  expiresAt: string | null;
  isTrial: boolean;
  willRenew: boolean;
};

const hasRevenueCatKey = () =>
  Boolean(REVENUECAT_IOS_KEY) && !REVENUECAT_IOS_KEY.includes("YOUR_REVENUECAT_IOS_API_KEY");

let configuredUserId: string | null = null;

export const configureRevenueCat = async (userId: string) => {
  if (configuredUserId === userId) return;
  if (!hasRevenueCatKey()) {
    throw new Error("RevenueCat iOS API key is missing. Set REVENUECAT_IOS_KEY in src/services/subscription.ts");
  }
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  await Purchases.logIn(userId);
  configuredUserId = userId;
};

export const isActiveSubscription = (info: CustomerInfo): boolean =>
  info.entitlements.active[ENTITLEMENT_ID] !== undefined;

const getPlanName = (productIdentifier: string): PlanName => {
  const productId = productIdentifier.toLowerCase();
  if (productId.includes("year")) return "Yearly";
  if (productId.includes("month")) return "Monthly";
  return "Subscription";
};

export const getCurrentSubscriptionDetails = (info: CustomerInfo): SubscriptionDetails | null => {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return null;
  return {
    productIdentifier: entitlement.productIdentifier,
    planName: getPlanName(entitlement.productIdentifier),
    expiresAt: entitlement.expirationDate,
    isTrial: entitlement.periodType === "TRIAL",
    willRenew: entitlement.willRenew,
  };
};

export const fetchOfferings = async (): Promise<PurchasesPackage[]> => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const sortPreferredPackages = (packages: PurchasesPackage[]) => {
  const rank = (pkg: PurchasesPackage) => {
    if (pkg.identifier === MONTHLY_PACKAGE_ID) return 0;
    if (pkg.identifier === YEARLY_PACKAGE_ID) return 1;
    return 2;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
};

export const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
  const result = await Purchases.purchasePackage(pkg);
  return isActiveSubscription(result.customerInfo);
};

export const restorePurchases = async (): Promise<boolean> => {
  const info = await Purchases.restorePurchases();
  return isActiveSubscription(info);
};

export const openManageSubscriptions = async () => {
  await Purchases.showManageSubscriptions();
};
