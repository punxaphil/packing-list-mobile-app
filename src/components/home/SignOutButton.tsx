import { Alert } from "react-native";
import { HOME_COPY } from "./styles.ts";

export const confirmSignOut = (email: string, onConfirm: () => void) =>
  Alert.alert(HOME_COPY.signOutTitle, `${HOME_COPY.signOutMessage} ${email || HOME_COPY.unknownUser}?`, [
    { text: HOME_COPY.signOutCancel, style: "cancel" },
    {
      text: HOME_COPY.signOutConfirm,
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
