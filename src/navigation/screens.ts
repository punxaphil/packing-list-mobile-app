import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { Navigation } from "react-native-navigation";
import { AppRoot } from "./AppRoot";
import { CategoriesScreen } from "./CategoriesScreen";
import { ItemsScreen } from "./ItemsScreen";
import { ListsScreen } from "./ListsScreen";
import { MembersScreen } from "./MembersScreen";
import { ProfileScreen } from "./ProfileScreen";
import { SCREEN_IDS } from "./screenIds";
import { withProviders } from "./withProviders";

function wrapScreen<P extends object>(Screen: React.ComponentType<P>) {
  return gestureHandlerRootHOC(withProviders(Screen));
}

export function registerScreens() {
  Navigation.registerComponent(SCREEN_IDS.APP_ROOT, () => wrapScreen(AppRoot));
  Navigation.registerComponent(SCREEN_IDS.ITEMS, () => wrapScreen(ItemsScreen));
  Navigation.registerComponent(SCREEN_IDS.LISTS, () => wrapScreen(ListsScreen));
  Navigation.registerComponent(SCREEN_IDS.CATEGORIES, () => wrapScreen(CategoriesScreen));
  Navigation.registerComponent(SCREEN_IDS.MEMBERS, () => wrapScreen(MembersScreen));
  Navigation.registerComponent(SCREEN_IDS.PROFILE, () => wrapScreen(ProfileScreen));
}
