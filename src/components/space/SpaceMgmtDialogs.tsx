import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { homeStyles } from "../home/styles.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

type DialogState = "none" | "rename" | "invite" | "inviteSent";

type Props = {
  dialogState: DialogState;
  setDialogState: (state: DialogState) => void;
  onRename: (name: string) => Promise<void>;
  onInvite: (email: string) => Promise<void>;
};

export const SpaceMgmtDialogs = ({ dialogState, setDialogState, onRename, onInvite }: Props) => {
  const [promptValue, setPromptValue] = useState("");

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
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View style={homeStyles.modalBackdrop}>
      <View style={homeStyles.modalCard}>
        <View style={homeStyles.modalCardContent}>
          <Text style={homeStyles.modalTitle}>{SPACE_MGMT_COPY.inviteSent}</Text>
          <View style={homeStyles.modalActions}>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{SPACE_MGMT_COPY.ok}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  </Modal>
);
