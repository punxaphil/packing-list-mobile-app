import { Navigation } from "react-native-navigation";
import { LogBox } from "react-native";
import { applyStoredLanguage } from "./src/i18n";
import "./src/services/database";
import { setDefaultOptions } from "./src/navigation/options";
import { registerScreens } from "./src/navigation/screens";

if (__DEV__) {
  LogBox.ignoreLogs(["[RevenueCat]"]);
}

registerScreens();
setDefaultOptions();

Navigation.events().registerAppLaunchedListener(async () => {
  await applyStoredLanguage();
  const { initSelection } = await import("./src/navigation/selectionState");
  await initSelection();
  const { registerPackingListReminderHandler } = await import("./src/services/packingListReminder");
  registerPackingListReminderHandler();

  Navigation.setRoot({
    root: {
      component: {
        name: "AppRoot",
      },
    },
  });
});
