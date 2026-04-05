import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { spaceCopy } from "./spaceCopy.ts";

type Props = { visible: boolean; onClose: () => void };

export const InviteSentDialog = ({ visible, onClose }: Props) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      return;
    }
    if (Platform.OS !== "ios" || shown) return;
    setShown(true);
    Alert.alert(spaceCopy.inviteSent, undefined, [{ text: spaceCopy.inviteSentOk, onPress: onClose }]);
  }, [visible, shown, onClose]);

  if (Platform.OS === "ios") return null;

  return (
    <DialogShell
      visible={visible}
      title={spaceCopy.inviteSent}
      onClose={onClose}
      actions={<DialogSingleAction label={spaceCopy.inviteSentOk} onPress={onClose} />}
    />
  );
};
