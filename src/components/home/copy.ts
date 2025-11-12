import { homeEmptyStateCopy } from "./theme.ts";

export type HomeCopy = {
  welcome: string;
  signedInAs: string;
  unknownUser: string;
  signOut: string;
  loading: string;
  itemsLoading: string;
  empty: string;
  emptyLists: string;
  emptyItems: string;
  listHeader: string;
  detailHeader: string;
  selectList: string;
};

export const homeCopy: HomeCopy = {
  welcome: "Welcome back",
  signedInAs: "Signed in as",
  unknownUser: "Unknown user",
  signOut: "Sign out",
  loading: "Loading...",
  itemsLoading: "Loading items...",
  empty: homeEmptyStateCopy,
  emptyLists: homeEmptyStateCopy,
  emptyItems: "No items in this list.",
  listHeader: "Your Packing Lists",
  detailHeader: "Packing Items",
  selectList: "Select a packing list to view its items.",
} as const;
