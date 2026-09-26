import type { createBrowserRouter } from "react-router-dom";
import { getSelectedId } from "./selectionState.ts";

type Router = ReturnType<typeof createBrowserRouter>;
let navigator: Router | null = null;

export const registerNavigator = (router: Router) => {
  navigator = router;
};

function switchToTab(screen: string) {
  void navigator?.navigate(`/MainTabs/${screen}`);
}

export function switchToItemsTab() {
  switchToTab("ItemsStack");
}

export function switchToListsTab() {
  switchToTab("ListsStack");
}

export function switchToMembersTab() {
  switchToTab("MembersStack");
}

export function popScreen() {
  if (window.history.state?.idx > 0) void navigator?.navigate(-1);
  else switchToTab(getSelectedId() ? "ItemsStack" : "ListsStack");
}

export function pushProfile() {
  void navigator?.navigate("/ProfileScreen");
}

export function pushListChanges(packingListId: string) {
  void navigator?.navigate(`/ListChanges/${encodeURIComponent(packingListId)}`);
}
