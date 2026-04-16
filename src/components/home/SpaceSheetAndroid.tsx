import { Modal, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AppLoadingState } from "../shared/AppLoadingState.tsx";
import { ActionMenu } from "./ActionMenu.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors } from "./theme.ts";
import type { useSpaceSheet } from "./useSpaceSheet.ts";

export type SpaceSheetSubDialog =
  | "none"
  | "create"
  | "rename"
  | "invite"
  | "inviteSent";

type Props = {
  visible: boolean;
  onClose: () => void;
  sheet: ReturnType<typeof useSpaceSheet>;
};

export const SpaceSheetAndroid = ({ visible, onClose, sheet: s }: Props) => {
  const items = s.spaces.map((space) => ({
    text: space.name,
    onPress: () => {
      s.switchSpace(space.id);
      onClose();
    },
  }));
  const inviteItems = s.pendingInvites.map((inv) => ({
    text: `${inv.spaceName} — ${spaceCopy.inviteFrom} ${inv.fromEmail}`,
    onPress: () => void onClose(),
  }));
  const headerRight = (
    <Pressable onPress={() => s.setSubDialog("create")} hitSlop={8}>
      <MaterialCommunityIcons
        name="plus"
        size={22}
        color={homeColors.buttonText}
      />
    </Pressable>
  );

  return (
    <>
      <ActionMenu
        visible={visible && s.subDialog === "none" && !s.creatingSpace}
        title={spaceCopy.switchSpace}
        items={[...items, ...inviteItems]}
        onClose={onClose}
        headerColor={homeColors.primary}
        headerTextColor={homeColors.primaryForeground}
        headerRight={headerRight}
      />
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
      <Modal visible={s.creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};
