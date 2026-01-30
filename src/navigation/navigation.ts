import { Platform } from "react-native";
import { Navigation } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds";

export function showMainTabs(showItems: boolean) {
  const tabs = [];

  if (showItems) {
    tabs.push({
      stack: {
        children: [{ component: { name: SCREEN_IDS.ITEMS } }],
        options: {
          bottomTab: {
            text: "Items",
            ...(Platform.OS === "ios" ? { sfSymbol: "checkmark.square" } : {}),
          },
        },
      },
    });
  }

  tabs.push(
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
    }
  );

  Navigation.setRoot({
    root: {
      bottomTabs: {
        id: "BOTTOM_TABS",
        children: tabs,
        options: {
          bottomTabs: {
            currentTabIndex: 0,
          },
        },
      },
    },
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
  showMainTabs(true);
}
