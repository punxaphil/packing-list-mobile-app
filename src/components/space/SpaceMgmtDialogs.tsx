import { useEffect, useState } from "react";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

type DialogState = "none" | "rename" | "invite" | "inviteSent";

type Props = {
  dialogState: DialogState;
  setDialogState: (state: DialogState) => void;
  currentName: string;
  onRename: (name: string) => Promise<void>;
  onInvite: (email: string) => Promise<void>;
};

export const SpaceMgmtDialogs = ({ dialogState, setDialogState, currentName, onRename, onInvite }: Props) => {
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    if (dialogState === "rename") setPromptValue(currentName);
  }, [dialogState, currentName]);

  const reset = () => {
    setPromptValue("");
    setDialogState("none");
  };

  const handleRename = async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) return;
    await onRename(trimmed);
    reset();
  };

  const handleInvite = async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) return;
    await onInvite(trimmed);
    setPromptValue("");
    setDialogState("inviteSent");
  };

  return (
    <>
      <TextPromptDialog
        visible={dialogState === "rename"}
        title={SPACE_MGMT_COPY.renamePrompt}
        confirmLabel={SPACE_MGMT_COPY.renameConfirm}
        value={promptValue}
        onChange={setPromptValue}
        onCancel={reset}
        onSubmit={handleRename}
      />
      <TextPromptDialog
        visible={dialogState === "invite"}
        title={SPACE_MGMT_COPY.invitePrompt}
        confirmLabel={SPACE_MGMT_COPY.inviteConfirm}
        value={promptValue}
        placeholder={SPACE_MGMT_COPY.invitePlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
        onChange={setPromptValue}
        onCancel={reset}
        onSubmit={handleInvite}
      />
      <InviteSentDialog visible={dialogState === "inviteSent"} onClose={reset} />
    </>
  );
};

const InviteSentDialog = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <DialogShell
    visible={visible}
    title={SPACE_MGMT_COPY.inviteSent}
    onClose={onClose}
    actions={<DialogSingleAction label={SPACE_MGMT_COPY.ok} onPress={onClose} />}
  />
);
