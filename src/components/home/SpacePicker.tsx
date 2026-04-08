import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { AppLoadingState } from "../shared/AppLoadingState.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { ActionMenu } from "./ActionMenu.tsx";
import { InviteSentDialog } from "./InviteSentDialog.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors, homeSpacing } from "./theme.ts";

type SpacePickerProps = {
  visible: boolean;
  onClose: () => void;
  onManageSpace?: () => void;
};
type SubDialog = "none" | "create" | "invite" | "inviteSent";

const EDIT_ICON = <MaterialCommunityIcons name="pencil-outline" size={18} color={homeColors.muted} />;
const CHECK_ICON = <MaterialCommunityIcons name="check" size={18} color={homeColors.primary} />;

export const SpacePicker = ({ visible, onClose, onManageSpace }: SpacePickerProps) => {
  const { spaces, spaceId, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite, sendInvite } = useInvites();
  const [subDialog, setSubDialog] = useState<SubDialog>("none");
  const [promptValue, setPromptValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);
  const isIosSheet = Platform.OS === "ios";

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

  const createSpace = async (name: string) => {
    setSubDialog("none");
    setCreatingSpace(true);
    try {
      const space = await createNewSpace(name);
      switchSpace(space.id);
      resetAndClose();
    } finally {
      setCreatingSpace(false);
    }
  };
  const handleCreateSubmit = () => {
    const trimmed = promptValue.trim();
    if (!trimmed || creatingSpace) return;
    void createSpace(trimmed);
  };
  const handleCreateText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || creatingSpace) return;
    void createSpace(trimmed);
  };

  const handleInviteSubmit = async () => {
    const trimmed = promptValue.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await sendInvite(trimmed);
      setPromptValue("");
      setSubDialog("inviteSent");
    } finally {
      setSubmitting(false);
    }
  };
  const handleInviteText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await sendInvite(trimmed);
      setPromptValue("");
      setSubDialog("inviteSent");
    } finally {
      setSubmitting(false);
    }
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
      {isIosSheet ? (
        <PageSheet
          visible={visible && subDialog === "none" && !creatingSpace}
          title={spaceCopy.switchSpace}
          onClose={onClose}
          scrollable={false}
        >
          <Pressable style={styles.createButton} onPress={() => setSubDialog("create")}>
            <MaterialCommunityIcons name="plus" size={20} color={homeColors.primary} />
            <Text style={styles.createButtonText}>{spaceCopy.createSpace}</Text>
          </Pressable>
          <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
            {spaces.map((space) => (
              <SpaceRow
                key={space.id}
                label={
                  space.id === profile?.personalSpaceId ? `${space.name} (${spaceCopy.personalSpace})` : space.name
                }
                active={space.id === spaceId}
                onPress={() => {
                  switchSpace(space.id);
                  onClose();
                }}
                onEdit={() => handleManageSpace(space.id)}
              />
            ))}
            {pendingInvites.length > 0 && <Text style={styles.sectionTitle}>{spaceCopy.pendingInvites}</Text>}
            {pendingInvites.map((invite) => (
              <SpaceRow
                key={`${invite.spaceId}-${invite.fromEmail}`}
                label={`${invite.spaceName} - ${spaceCopy.inviteFrom} ${invite.fromEmail}`}
                onPress={() => void handleAccept(invite)}
              />
            ))}
          </ScrollView>
        </PageSheet>
      ) : (
        <ActionMenu
          visible={visible && subDialog === "none" && !creatingSpace}
          title={spaceCopy.switchSpace}
          items={[...spaceItems, ...inviteItems]}
          onClose={onClose}
          headerColor={homeColors.primary}
          headerTextColor={homeColors.primaryForeground}
          headerRight={headerRight}
        />
      )}
      <TextPromptDialog
        visible={subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        disabled={creatingSpace}
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmitText={handleCreateText}
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
        disabled={submitting}
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmitText={handleInviteText}
        onSubmit={handleInviteSubmit}
      />
      <InviteSentDialog visible={subDialog === "inviteSent"} onClose={resetAndClose} />
      <Modal visible={creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};

type SpaceRowProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  onEdit?: () => void;
};

const SpaceRow = ({ label, active = false, onPress, onEdit }: SpaceRowProps) => (
  <View style={styles.row}>
    <Pressable style={({ pressed }) => [styles.rowMain, pressed ? styles.rowPressed : null]} onPress={onPress}>
      <View style={styles.rowIcon}>{active ? CHECK_ICON : null}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
    {onEdit ? (
      <Pressable
        style={({ pressed }) => [styles.editButton, pressed ? styles.editButtonPressed : null]}
        onPress={onEdit}
      >
        {EDIT_ICON}
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  createButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  createButtonText: { fontSize: 15, fontWeight: "600", color: homeColors.muted },
  sheetList: { flex: 1, minHeight: 0 },
  sheetListContent: { paddingBottom: homeSpacing.sm, gap: homeSpacing.xs },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: homeColors.muted,
    marginTop: homeSpacing.sm,
    marginBottom: homeSpacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.xs,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: "rgba(219,234,254,0.95)",
    transform: [{ scale: 0.985 }],
  },
  rowIcon: { width: 22, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 16, color: homeColors.text },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  editButtonPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
