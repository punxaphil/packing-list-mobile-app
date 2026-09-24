import { Alert, Platform } from "react-native";
import { HOME_COPY } from "./styles.ts";

export const confirmSignOut = (email: string, onConfirm: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${HOME_COPY.signOutTitle}\n${HOME_COPY.signOutMessage} ${email || HOME_COPY.unknownUser}?`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(HOME_COPY.signOutTitle, `${HOME_COPY.signOutMessage} ${email || HOME_COPY.unknownUser}?`, [
    { text: HOME_COPY.signOutCancel, style: "cancel" },
    {
      text: HOME_COPY.signOutConfirm,
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
};
