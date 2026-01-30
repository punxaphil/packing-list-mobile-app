import { Navigation } from "react-native-navigation";
import "./src/services/database";

Navigation.events().registerAppLaunchedListener(async () => {
  const { initSelection } = await import("./src/navigation/selectionState");
  await initSelection();

  const { registerScreens } = await import("./src/navigation/screens");
  const { setDefaultOptions } = await import("./src/navigation/options");

  registerScreens();
  setDefaultOptions();

  Navigation.setRoot({
    root: {
      component: {
        name: "AppRoot",
      },
    },
  });
});
