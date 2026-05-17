import { Alert, Modal } from "react-native";
import { AppLoadingState } from "../shared/AppLoadingState.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import type { useSpaceSheet } from "./useSpaceSheet.ts";

type Props = { sheet: ReturnType<typeof useSpaceSheet> };

export const SpaceSheetDialogs = ({ sheet: s }: Props) => {
  const submitRename = () => {
    const trimmed = s.promptValue.trim();
    if (!trimmed) return;
    void s.mgmt.rename(trimmed);
    s.resetSubDialog();
  };
  const submitInvite = async () => {
    const trimmed = s.promptValue.trim();
    if (!trimmed) return;
    await s.mgmt.invite(trimmed);
    s.resetSubDialog();
    Alert.alert(spaceCopy.inviteSent);
  };

  return (
    <>
      <TextPromptDialog
        visible={s.subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={s.promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        disabled={s.creatingSpace}
        onChange={s.setPromptValue}
        onCancel={s.resetSubDialog}
        onSubmit={s.handleCreateSubmit}
      />
      <TextPromptDialog
        visible={s.subDialog === "rename"}
        title={spaceCopy.renamePrompt}
        confirmLabel={spaceCopy.renameConfirm}
        value={s.promptValue}
        onChange={s.setPromptValue}
        onCancel={s.resetSubDialog}
        onSubmitText={() => submitRename()}
        onSubmit={submitRename}
      />
      <TextPromptDialog
        visible={s.subDialog === "invite"}
        title={spaceCopy.invitePrompt}
        confirmLabel={spaceCopy.inviteConfirm}
        value={s.promptValue}
        keyboardType="email-address"
        onChange={s.setPromptValue}
        onCancel={s.resetSubDialog}
        onSubmitText={async () => submitInvite()}
        onSubmit={() => void submitInvite()}
      />
      <Modal visible={s.creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};
