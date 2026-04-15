import { translatedCopy } from "~/i18n/translatedCopy.ts";

type SubscriptionCopy = {
  title: string;
  subtitle: string;
  info: string;
  noOfferings: string;
  renewalNote: string;
  featuresHeading: string;
  features: string[];
  restorePurchases: string;
  signOut: string;
  freeTrialLabel: string;
  privacy: string;
  eula: string;
};

export const subscriptionCopy = translatedCopy<SubscriptionCopy>("subscription");
