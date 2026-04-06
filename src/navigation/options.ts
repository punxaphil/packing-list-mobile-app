import { Navigation } from "react-native-navigation";
import { homeColors } from "~/components/home/theme.ts";

const MUTED_COLOR = "#6b7280";

export function setDefaultOptions() {
  Navigation.setDefaultOptions({
    statusBar: {
      style: "dark",
    },
    topBar: {
      visible: false,
    },
    bottomTabs: {
      titleDisplayMode: "alwaysShow",
      translucent: true,
      hideShadow: false,
    },
    bottomTab: {
      selectedTextColor: MUTED_COLOR,
      selectedIconColor: homeColors.primary,
      textColor: MUTED_COLOR,
      iconColor: MUTED_COLOR,
      fontSize: 10,
    },
    layout: {
      componentBackgroundColor: "#ffffff",
    },
  });
}
