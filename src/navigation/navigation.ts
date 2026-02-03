import { Platform } from "react-native";
import { Navigation, OptionsTopBarButton } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds";

export const BUTTON_IDS = {
  PROFILE: "profileButton",
  LOGO: "logoButton",
  FILTER: "filterButton",
  SORT: "sortButton",
  ARCHIVED: "archivedButton",
};

const profileButton = {
  id: BUTTON_IDS.PROFILE,
  sfSymbol: "person.circle.fill",
};

export function showMainTabs() {
  const tabs = [];

  tabs.push(
    {
      stack: {
        children: [
          {
            component: {
              name: SCREEN_IDS.ITEMS,
            },
          },
        ],

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
        children: [
          {
            component: {
              name: SCREEN_IDS.LISTS,
            },
          },
        ],
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
        children: [
          {
            component: {
              name: SCREEN_IDS.CATEGORIES,
            },
          },
        ],
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
        children: [
          {
            component: {
              name: SCREEN_IDS.MEMBERS,
            },
          },
        ],
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
  Navigation.mergeOptions(SCREEN_IDS.ITEMS, {
    topBar: {
      title: { text: "Items" },
      rightButtons: [profileButton],
    },
  });
}
export function pushProfile(componentId: string) {
  Navigation.push(componentId, {
    component: {
      name: SCREEN_IDS.PROFILE,
      options: {
        bottomTabs: { visible: false },
        topBar: {
          title: { text: "Profile" },
          backButton: { visible: true },
          leftButtons: [],
          rightButtons: [],
          background: {
            translucent: true,
            blur: true,
          },
        },
      },
    },
  });
}

export function updateTopBar(
  componentId: string,
  title: string,
  options: {
    profileImageUrl?: string;
    showFilter?: boolean;
    filterActive?: boolean;
    showSort?: boolean;
    sortByAlpha?: boolean;
    showArchived?: boolean;
    archivedActive?: boolean;
  }
) {
  const rightButtons: OptionsTopBarButton[] = [];

  rightButtons.push({
    id: BUTTON_IDS.PROFILE,
    sfSymbol: "person.circle.fill",
    color: "#6b7280",
  });

  if (options.showFilter) {
    rightButtons.push({
      id: BUTTON_IDS.FILTER,
      sfSymbol: options.filterActive ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease",
      color: options.filterActive ? "#2563eb" : "#6b7280",
    });
  }

  Navigation.mergeOptions(componentId, {
    topBar: {
      title: { text: title },
      rightButtons,
    },
  });
}

export function switchToItemsTab() {
  showMainTabs();
}
