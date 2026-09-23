import { createNavigationContainerRef } from "@react-navigation/native";
import type { MainTabsParamList, RootStackParamList } from "./RootNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function switchToTab(screen: keyof MainTabsParamList) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("MainTabs", { screen });
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
  if (navigationRef.isReady() && navigationRef.canGoBack()) navigationRef.goBack();
}

export function pushProfile() {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("ProfileScreen");
}

export function pushListChanges(packingListId: string) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("ListChanges", { packingListId });
}
