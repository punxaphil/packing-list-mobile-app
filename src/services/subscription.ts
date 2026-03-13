import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

const REVENUECAT_IOS_KEY = "appl_MAycwXxDDcWiytfvDCHGUZVkGRR";
const ENTITLEMENT_ID = "entitlement-1";
const MONTHLY_PACKAGE_ID = "monthly";
const YEARLY_PACKAGE_ID = "yearly";

const hasRevenueCatKey = () =>
  Boolean(REVENUECAT_IOS_KEY) &&
  !REVENUECAT_IOS_KEY.includes("YOUR_REVENUECAT_IOS_API_KEY");

let configuredUserId: string | null = null;

export const configureRevenueCat = async (userId: string) => {
  if (configuredUserId === userId) return;
  if (!hasRevenueCatKey()) {
    throw new Error(
      "RevenueCat iOS API key is missing. Set REVENUECAT_IOS_KEY in src/services/subscription.ts",
    );
  }
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  await Purchases.logIn(userId);
  configuredUserId = userId;
};

export const isActiveSubscription = (info: CustomerInfo): boolean =>
  info.entitlements.active[ENTITLEMENT_ID] !== undefined;

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

export const purchasePackage = async (
  pkg: PurchasesPackage,
): Promise<boolean> => {
  const result = await Purchases.purchasePackage(pkg);
  return isActiveSubscription(result.customerInfo);
};

export const restorePurchases = async (): Promise<boolean> => {
  const info = await Purchases.restorePurchases();
  return isActiveSubscription(info);
};
