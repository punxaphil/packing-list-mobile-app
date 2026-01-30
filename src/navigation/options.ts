import { Navigation } from "react-native-navigation";

const PRIMARY_COLOR = "#2563eb";
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
      selectedTextColor: PRIMARY_COLOR,
      selectedIconColor: PRIMARY_COLOR,
      textColor: MUTED_COLOR,
      iconColor: MUTED_COLOR,
      fontSize: 10,
    },
    layout: {
      componentBackgroundColor: "#ffffff",
    },
  });
}
