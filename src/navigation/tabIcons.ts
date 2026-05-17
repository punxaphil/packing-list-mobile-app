import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const TAB_ICON_SIZE = 22;
const TAB_ICON_COLOR = "#111827";
const TAB_SELECTED_COLOR = "#2563eb";

type TabIconName = "checkbox-marked-outline" | "format-list-bulleted" | "view-grid-outline" | "heart-outline";

export const getTabIcon = (name: TabIconName) =>
  MaterialCommunityIcons.getImageSourceSync(name, TAB_ICON_SIZE, TAB_ICON_COLOR);

export const getSelectedTabIcon = (name: TabIconName) =>
  MaterialCommunityIcons.getImageSourceSync(name, TAB_ICON_SIZE, TAB_SELECTED_COLOR);

export const TAB_SELECTED_TEXT_COLOR = TAB_SELECTED_COLOR;
