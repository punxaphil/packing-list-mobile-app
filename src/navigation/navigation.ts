import i18next from "i18next";
import { Platform } from "react-native";
import { Navigation } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds";
import { getSelectedTabIcon, getTabIcon, TAB_SELECTED_TEXT_COLOR } from "./tabIcons";

export const ITEMS_TAB = 0;
export const LISTS_TAB = 1;
const MEMBERS_TAB = 3;
const BOTTOM_TABS_ID = "BOTTOM_TABS";

const getBottomTabOptions = (text: string, sfSymbol: string, icon: Parameters<typeof getTabIcon>[0]) => ({
  text,
  ...(Platform.OS === "ios"
    ? { sfSymbol }
    : { icon: getTabIcon(icon), selectedIcon: getSelectedTabIcon(icon), selectedTextColor: TAB_SELECTED_TEXT_COLOR }),
});

const createTab = (name: string, text: string, sfSymbol: string, icon: Parameters<typeof getTabIcon>[0]) => ({
  stack: {
    children: [{ component: { name } }],
    options: { bottomTab: getBottomTabOptions(text, sfSymbol, icon) },
  },
});

export function showMainTabs(currentTabIndex = LISTS_TAB) {
  const bottomTabText = {
    items: i18next.t("navigation.items"),
    lists: i18next.t("navigation.lists"),
    categories: i18next.t("navigation.categories"),
    members: i18next.t("navigation.members"),
  };
  Navigation.setRoot({
    root: {
      bottomTabs: {
        id: BOTTOM_TABS_ID,
        children: [
          createTab(SCREEN_IDS.ITEMS, bottomTabText.items, "checkmark.square", "checkbox-marked-outline"),
          createTab(SCREEN_IDS.LISTS, bottomTabText.lists, "list.bullet", "format-list-bulleted"),
          createTab(SCREEN_IDS.CATEGORIES, bottomTabText.categories, "square.grid.2x2", "view-grid-outline"),
          createTab(SCREEN_IDS.MEMBERS, bottomTabText.members, "heart", "heart-outline"),
        ],
        options: {
          bottomTabs: {
            currentTabIndex,
          },
        },
      },
    },
  });
}

function switchToTab(tabIndex: number) {
  Navigation.mergeOptions(BOTTOM_TABS_ID, {
    bottomTabs: { currentTabIndex: tabIndex },
  });
}

export function pushProfile(componentId: string) {
  Navigation.push(componentId, {
    component: {
      name: SCREEN_IDS.PROFILE,
      options: {
        bottomTabs: { visible: false },
      },
    },
  });
}

export function pushListChanges(componentId: string, packingListId: string) {
  Navigation.push(componentId, {
    component: {
      name: SCREEN_IDS.LIST_CHANGES,
      passProps: { packingListId },
      options: {
        bottomTabs: { visible: false },
      },
    },
  });
}

export function popScreen(componentId: string) {
  Navigation.pop(componentId);
}

export function switchToItemsTab() {
  switchToTab(ITEMS_TAB);
}

export function switchToListsTab() {
  switchToTab(LISTS_TAB);
}

export function switchToMembersTab() {
  switchToTab(MEMBERS_TAB);
}
