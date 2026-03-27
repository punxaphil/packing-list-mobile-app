import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { spaceCopy } from "./spaceCopy.ts";

type Props = { visible: boolean; onClose: () => void };

export const InviteSentDialog = ({ visible, onClose }: Props) => (
  <DialogShell
    visible={visible}
    title={spaceCopy.inviteSent}
    onClose={onClose}
    actions={<DialogSingleAction label={spaceCopy.inviteSentOk} onPress={onClose} />}
  />
);
