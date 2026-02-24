import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getUserImagesByEmail } from "~/services/spaceDatabase.ts";
import { ActionMenu } from "../home/ActionMenu.tsx";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { SpaceMgmtDialogs } from "./SpaceMgmtDialogs.tsx";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";
import { UserList } from "./UserList.tsx";
import { useSpaceManagement } from "./useSpaceManagement.ts";

type Props = { onBack: () => void };

export const SpaceManagementScreen = ({ onBack }: Props) => {
  const { activeSpace } = useSpace();
  const mgmt = useSpaceManagement(onBack);
  const [dialogState, setDialogState] = useState<"none" | "rename" | "invite" | "inviteSent">("none");
  const [removeEmail, setRemoveEmail] = useState<string | null>(null);
  const [confirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imagesByEmail, setImagesByEmail] = useState<Record<string, string>>({});

  const memberIds = activeSpace?.members;

  useEffect(() => {
    if (!memberIds?.length) return;
    void getUserImagesByEmail(memberIds).then(setImagesByEmail);
  }, [memberIds]);

  const onDeletePress = async () => {
    const error = await mgmt.getDeleteError();
    if (error) {
      setDeleteError(error);
      return;
    }
    setConfirmDeleteVisible(true);
  };

  const removeUser = async () => {
    if (!removeEmail) return;
    await mgmt.removeUser(removeEmail);
    setRemoveEmail(null);
  };

  if (!activeSpace) return null;

  return (
    <View style={styles.container}>
      <Header onBack={onBack} />
      <View style={styles.content}>
        <SpaceNameRow name={activeSpace.name} onRename={() => setDialogState("rename")} />
        <UserList
          emails={activeSpace.memberEmails}
          onRequestRemove={setRemoveEmail}
          currentEmail={mgmt.currentEmail}
          imagesByEmail={imagesByEmail}
        />
        <ActionButtons
          onInvite={() => setDialogState("invite")}
          onLeave={() => setConfirmLeaveVisible(true)}
          onDelete={() => void onDeletePress()}
          isPersonal={mgmt.isPersonalSpace}
        />
      </View>
      <SpaceMgmtDialogs
        dialogState={dialogState}
        setDialogState={setDialogState}
        onRename={mgmt.rename}
        onInvite={mgmt.invite}
      />
      <ActionMenu
        visible={confirmLeaveVisible}
        title={SPACE_MGMT_COPY.confirmLeave}
        onClose={() => setConfirmLeaveVisible(false)}
        items={[{ text: SPACE_MGMT_COPY.confirm, style: "destructive", onPress: () => void mgmt.leave() }]}
      />
      <ActionMenu
        visible={confirmDeleteVisible}
        title={SPACE_MGMT_COPY.confirmDelete}
        onClose={() => setConfirmDeleteVisible(false)}
        items={[{ text: SPACE_MGMT_COPY.confirm, style: "destructive", onPress: () => void mgmt.deleteCurrentSpace() }]}
      />
      <ActionMenu
        visible={Boolean(removeEmail)}
        title={SPACE_MGMT_COPY.confirmRemove}
        onClose={() => setRemoveEmail(null)}
        items={[{ text: SPACE_MGMT_COPY.confirm, style: "destructive", onPress: () => void removeUser() }]}
      />
      <ActionMenu
        visible={Boolean(deleteError)}
        title={deleteError ?? ""}
        onClose={() => setDeleteError(null)}
        items={[]}
      />
    </View>
  );
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
      <Text style={styles.backText}>← Back</Text>
    </Pressable>
    <Text style={styles.title}>{SPACE_MGMT_COPY.title}</Text>
    <View style={styles.placeholder} />
  </View>
);

const SpaceNameRow = ({ name, onRename }: { name: string; onRename: () => void }) => (
  <View style={styles.nameRow}>
    <Text style={styles.spaceName}>{name}</Text>
    <Pressable onPress={onRename} hitSlop={8}>
      <Text style={styles.renameLink}>{SPACE_MGMT_COPY.rename}</Text>
    </Pressable>
  </View>
);

type ActionButtonsProps = {
  onInvite: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isPersonal: boolean;
};

const ActionButtons = ({ onInvite, onLeave, onDelete, isPersonal }: ActionButtonsProps) => (
  <View style={styles.actions}>
    <Pressable style={styles.primaryButton} onPress={onInvite}>
      <Text style={styles.primaryButtonText}>{SPACE_MGMT_COPY.invite}</Text>
    </Pressable>
    {!isPersonal && (
      <>
        <Pressable style={styles.outlineButton} onPress={onLeave}>
          <Text style={styles.outlineButtonText}>{SPACE_MGMT_COPY.leave}</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={onDelete}>
          <Text style={styles.dangerButtonText}>{SPACE_MGMT_COPY.delete}</Text>
        </Pressable>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: homeSpacing.md,
  },
  backButton: { minWidth: 60 },
  backText: { color: homeColors.primary, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: homeColors.text },
  placeholder: { minWidth: 60 },
  content: { flex: 1, paddingHorizontal: homeSpacing.lg, gap: homeSpacing.lg },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  spaceName: { fontSize: 22, fontWeight: "700", color: homeColors.text },
  renameLink: { fontSize: 14, fontWeight: "600", color: homeColors.primary },
  actions: { gap: homeSpacing.sm, marginTop: homeSpacing.md },
  primaryButton: {
    paddingVertical: homeSpacing.md,
    borderRadius: homeRadius,
    backgroundColor: homeColors.primary,
    alignItems: "center",
  },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: homeColors.buttonText },
  outlineButton: {
    paddingVertical: homeSpacing.md,
    borderRadius: homeRadius,
    borderWidth: 1,
    borderColor: homeColors.border,
    alignItems: "center",
  },
  outlineButtonText: { fontSize: 16, fontWeight: "600", color: homeColors.text },
  dangerButton: {
    paddingVertical: homeSpacing.md,
    borderRadius: homeRadius,
    borderWidth: 1,
    borderColor: homeColors.danger,
    alignItems: "center",
  },
  dangerButtonText: { fontSize: 16, fontWeight: "600", color: homeColors.danger },
});
