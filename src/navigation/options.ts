import { Navigation } from "react-native-navigation";

const PRIMARY_COLOR = "#2563eb";
const MUTED_COLOR = "#6b7280";

export function setDefaultOptions() {
  Navigation.setDefaultOptions({
    statusBar: {
      style: "dark",
    },
    topBar: {
      visible: true,
      noBorder: true,
      animate: true,
      animateRightButtons: true,
      rightButtonColor: MUTED_COLOR,
      title: {
        color: "#000000",
        fontSize: 17,
        fontWeight: "600",
      },

      background: { color: "transparent" },
      drawBehind: true,
      // @ts-expect-error: translucent is supported on iOS but not in type
      translucent: true,
      elevation: 0,
      borderHeight: 0,
      searchBar: {
        backgroundColor: "#ffffffee",
        tintColor: PRIMARY_COLOR,
      },
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
