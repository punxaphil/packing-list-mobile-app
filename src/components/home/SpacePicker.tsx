import { useState } from "react";
import { Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { ActionMenu } from "./ActionMenu.tsx";
import { InviteSentDialog } from "./InviteSentDialog.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors } from "./theme.ts";

type SpacePickerProps = { visible: boolean; onClose: () => void; onManageSpace?: () => void };
type SubDialog = "none" | "create" | "invite" | "inviteSent";

const EDIT_ICON = <MaterialCommunityIcons name="pencil-outline" size={18} color={homeColors.muted} />;
const CHECK_ICON = <MaterialCommunityIcons name="check" size={18} color={homeColors.primary} />;

export const SpacePicker = ({ visible, onClose, onManageSpace }: SpacePickerProps) => {
  const { spaces, spaceId, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite, sendInvite } = useInvites();
  const [subDialog, setSubDialog] = useState<SubDialog>("none");
  const [promptValue, setPromptValue] = useState("");

  const handleManageSpace = (targetSpaceId: string) => {
    switchSpace(targetSpaceId);
    onClose();
    onManageSpace?.();
  };

  const handleAccept = async (invite: SpaceInvite) => {
    await acceptInvite(invite);
    switchSpace(invite.spaceId);
    onClose();
  };

  const handleCreateSubmit = async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) return;
    const space = await createNewSpace(trimmed);
    switchSpace(space.id);
    resetAndClose();
  };

  const handleInviteSubmit = async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) return;
    await sendInvite(trimmed);
    setPromptValue("");
    setSubDialog("inviteSent");
  };

  const resetAndClose = () => {
    setPromptValue("");
    setSubDialog("none");
    onClose();
  };

  const resetSubDialog = () => {
    setPromptValue("");
    setSubDialog("none");
  };

  const buildSpaceItem = (space: { id: string; name: string }) => {
    const isPersonal = space.id === profile?.personalSpaceId;
    const isActive = space.id === spaceId;
    const label = isPersonal ? `${space.name} (${spaceCopy.personalSpace})` : space.name;
    return {
      text: label,
      onPress: () => {
        switchSpace(space.id);
        onClose();
      },
      leftIcon: isActive ? CHECK_ICON : undefined,
      rightIcon: EDIT_ICON,
      onRightPress: () => handleManageSpace(space.id),
    };
  };

  const spaceItems = spaces.map(buildSpaceItem);
  const inviteItems = pendingInvites.map((inv) => ({
    text: `${inv.spaceName} \u2014 ${spaceCopy.inviteFrom} ${inv.fromEmail}`,
    onPress: () => handleAccept(inv),
  }));

  const headerRight = (
    <Pressable onPress={() => setSubDialog("create")} hitSlop={8}>
      <MaterialCommunityIcons name="plus" size={22} color={homeColors.buttonText} />
    </Pressable>
  );

  return (
    <>
      <ActionMenu
        visible={visible && subDialog === "none"}
        title={spaceCopy.switchSpace}
        items={[...spaceItems, ...inviteItems]}
        onClose={onClose}
        headerColor={homeColors.primary}
        headerTextColor={homeColors.buttonText}
        headerRight={headerRight}
      />
      <TextPromptDialog
        visible={subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmit={handleCreateSubmit}
      />
      <TextPromptDialog
        visible={subDialog === "invite"}
        title={spaceCopy.invitePrompt}
        confirmLabel={spaceCopy.inviteConfirm}
        value={promptValue}
        placeholder={spaceCopy.invitePlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmit={handleInviteSubmit}
      />
      <InviteSentDialog visible={subDialog === "inviteSent"} onClose={resetAndClose} />
    </>
  );
};
