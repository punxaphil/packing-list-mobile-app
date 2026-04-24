import { Navigation } from "react-native-navigation";
import "./src/services/database";
import { setDefaultOptions } from "./src/navigation/options";
import { registerScreens } from "./src/navigation/screens";

registerScreens();
setDefaultOptions();

Navigation.events().registerAppLaunchedListener(async () => {
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
