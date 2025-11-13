import { homeEmptyStateCopy } from "./theme.ts";

export type HomeCopy = {
  unknownUser: string;
  signOutTitle: string;
  signOutMessage: string;
  signOutCancel: string;
  signOutConfirm: string;
  loading: string;
  itemsLoading: string;
  empty: string;
  emptyItems: string;
  listHeader: string;
  detailHeader: string;
  back: string;
  avatarFallback: string;
  addItem: string;
  deleteItem: string;
  newItem: string;
};

export const homeCopy: HomeCopy = {
  unknownUser: "Unknown user",
  signOutTitle: "Sign out?",
  signOutMessage: "Sign out as",
  signOutCancel: "Stay signed in",
  signOutConfirm: "Sign out",
  loading: "Loading...",
  itemsLoading: "Loading items...",
  empty: homeEmptyStateCopy,
  emptyItems: "No items in this list.",
  listHeader: "Your Packing Lists",
  detailHeader: "Packing Items",
  back: "< Back",
  avatarFallback: "?",
  addItem: "Add item",
  deleteItem: "Remove item",
  newItem: "New item",
} as const;
