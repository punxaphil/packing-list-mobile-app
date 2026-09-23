import { AppRegistry, LogBox } from "react-native";
import { App } from "./src/navigation/App";
import { name as appName } from "./app.json";

if (__DEV__) {
  LogBox.ignoreLogs(["[RevenueCat]"]);
}

AppRegistry.registerComponent(appName, () => App);
