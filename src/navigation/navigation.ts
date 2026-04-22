import { Platform } from "react-native";
import { Navigation } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds";

export const ITEMS_TAB = 0;
export const LISTS_TAB = 1;
const MEMBERS_TAB = 3;
const BOTTOM_TABS_ID = "BOTTOM_TABS";

export function showLoginRoot() {
  Navigation.setRoot({
    root: {
      component: {
        name: SCREEN_IDS.LOGIN,
      },
    },
  });
}

export function showMainTabs(currentTabIndex = LISTS_TAB) {
  Navigation.setRoot({
    root: {
      bottomTabs: {
        id: BOTTOM_TABS_ID,
        children: [
          {
            stack: {
              children: [{ component: { name: SCREEN_IDS.ITEMS } }],
              options: {
                bottomTab: {
                  text: "Items",
                  ...(Platform.OS === "ios" ? { sfSymbol: "checkmark.square" } : {}),
                },
              },
            },
          },
          {
            stack: {
              children: [{ component: { name: SCREEN_IDS.LISTS } }],
              options: {
                bottomTab: {
                  text: "Lists",
                  ...(Platform.OS === "ios" ? { sfSymbol: "list.bullet" } : {}),
                },
              },
            },
          },
          {
            stack: {
              children: [{ component: { name: SCREEN_IDS.CATEGORIES } }],
              options: {
                bottomTab: {
                  text: "Categories",
                  ...(Platform.OS === "ios" ? { sfSymbol: "square.grid.2x2" } : {}),
                },
              },
            },
          },
          {
            stack: {
              children: [{ component: { name: SCREEN_IDS.MEMBERS } }],
              options: {
                bottomTab: {
                  text: "Members",
                  ...(Platform.OS === "ios" ? { sfSymbol: "heart" } : {}),
                },
              },
            },
          },
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
