import Purchases, { type CustomerInfo } from "react-native-purchases";

const REVENUECAT_IOS_KEY = "YOUR_REVENUECAT_IOS_API_KEY";
const ENTITLEMENT_ID = "premium";
const WHITELISTED_EMAILS = new Set(["johan.frick@gmail.com"]);

export const isWhitelistedUser = (email: string): boolean => WHITELISTED_EMAILS.has(email);

export const configureRevenueCat = async (userId: string) => {
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  await Purchases.logIn(userId);
};

export const isActiveSubscription = (info: CustomerInfo): boolean =>
  info.entitlements.active[ENTITLEMENT_ID] !== undefined;
