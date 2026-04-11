import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getUserImagesByEmail } from "~/services/spaceDatabase.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { AppLoadingState } from "../shared/AppLoadingState.tsx";
import { Button } from "../shared/Button.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { SpaceMgmtDialogs } from "../space/SpaceMgmtDialogs.tsx";
import { UserList } from "../space/UserList.tsx";
import { useSpaceManagement } from "../space/useSpaceManagement.ts";
import { ActionMenu } from "./ActionMenu.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors, homeSpacing } from "./theme.ts";

type SpaceSheetProps = { visible: boolean; onClose: () => void };
type SubDialog = "none" | "create" | "rename" | "invite" | "inviteSent";

export const SpaceSheet = ({ visible, onClose }: SpaceSheetProps) => {
  const { spaces, spaceId, activeSpace, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite } = useInvites();
  const mgmt = useSpaceManagement(onClose);
  const [subDialog, setSubDialog] = useState<SubDialog>("none");
  const [promptValue, setPromptValue] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [imagesByEmail, setImagesByEmail] = useState<Record<string, string>>({});
  const otherSpaces = spaces.filter((s) => s.id !== spaceId);

  useEffect(() => {
    if (!activeSpace?.members?.length) return;
    void getUserImagesByEmail(activeSpace.members).then(setImagesByEmail);
  }, [activeSpace?.members]);

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

  const resetAndClose = () => {
    setPromptValue("");
    setSubDialog("none");
    onClose();
  };

  const resetSubDialog = () => {
    setPromptValue("");
    setSubDialog("none");
  };

  if (Platform.OS !== "ios") {
    return (
      <AndroidPicker
        visible={visible}
        onClose={onClose}
        subDialog={subDialog}
        setSubDialog={setSubDialog}
        promptValue={promptValue}
        setPromptValue={setPromptValue}
        handleCreateSubmit={handleCreateSubmit}
        creatingSpace={creatingSpace}
        resetSubDialog={resetSubDialog}
      />
    );
  }

  return (
    <>
      <PageSheet
        visible={visible && subDialog === "none" && !creatingSpace}
        title={COPY.title}
        onClose={onClose}
        scrollable={false}
      >
        <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
          <SpaceNameRow name={activeSpace?.name ?? ""} onRename={() => setSubDialog("rename")} />
          {activeSpace && (
            <UserList
              emails={activeSpace.memberEmails}
              onRemove={mgmt.removeUser}
              currentEmail={mgmt.currentEmail}
              imagesByEmail={imagesByEmail}
              isOwner={mgmt.isOwner}
            />
          )}
          <SpaceActions
            onCreate={() => setSubDialog("create")}
            onInvite={() => setSubDialog("invite")}
            onLeave={mgmt.leave}
            onDelete={mgmt.confirmDelete}
            isPersonal={mgmt.isPersonalSpace}
            isOwner={mgmt.isOwner}
          />
          <InviteSection invites={pendingInvites} onAccept={handleAccept} />
          {otherSpaces.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{COPY.switchSpace}</Text>
              {otherSpaces.map((space) => (
                <SpaceRow
                  key={space.id}
                  label={buildLabel(space.name, space.id === profile?.personalSpaceId)}
                  onPress={() => {
                    switchSpace(space.id);
                    onClose();
                  }}
                />
              ))}
            </>
          )}
        </ScrollView>
      </PageSheet>
      <SpaceMgmtDialogs
        dialogState={
          subDialog === "rename" || subDialog === "invite" || subDialog === "inviteSent" ? subDialog : "none"
        }
        setDialogState={(s) => setSubDialog(s === "none" ? "none" : s)}
        currentName={activeSpace?.name ?? ""}
        onRename={mgmt.rename}
        onInvite={mgmt.invite}
      />
      <TextPromptDialog
        visible={subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        disabled={creatingSpace}
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmitText={(t) => {
          const v = t.trim();
          if (v && !creatingSpace) void createSpace(v);
        }}
        onSubmit={handleCreateSubmit}
      />
      <Modal visible={creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};

const COPY = {
  title: "Spaces",
  create: "Create",
  invite: "Invite",
  switchSpace: "Switch Space",
} as const;

const buildLabel = (name: string, isPersonal: boolean) => (isPersonal ? `${name} (${spaceCopy.personalSpace})` : name);

const SpaceNameRow = ({ name, onRename }: { name: string; onRename: () => void }) => (
  <View style={styles.nameRow}>
    <Text style={styles.spaceName} numberOfLines={1}>
      {name}
    </Text>
    <Pressable onPress={onRename} hitSlop={8}>
      <MaterialCommunityIcons name="pencil-outline" size={18} color={homeColors.muted} />
    </Pressable>
  </View>
);

type SpaceActionsProps = {
  onCreate: () => void;
  onInvite: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isPersonal: boolean;
  isOwner: boolean;
};

const SpaceActions = ({ onCreate, onInvite, onLeave, onDelete, isPersonal, isOwner }: SpaceActionsProps) => (
  <View style={styles.actions}>
    <View style={styles.buttonRow}>
      <Button icon="plus" label={COPY.create} onPress={onCreate} flex />
      {isOwner && <Button icon="account-plus-outline" label={COPY.invite} onPress={onInvite} flex />}
    </View>
    {!isPersonal && !isOwner && <Button label={spaceCopy.leaveSpace} onPress={onLeave} />}
    {!isPersonal && isOwner && <Button label={spaceCopy.deleteSpace} onPress={onDelete} variant="danger" />}
  </View>
);

const InviteSection = ({ invites, onAccept }: { invites: SpaceInvite[]; onAccept: (i: SpaceInvite) => void }) => {
  if (!invites.length) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>{spaceCopy.pendingInvites}</Text>
      {invites.map((inv) => (
        <SpaceRow
          key={`${inv.spaceId}-${inv.fromEmail}`}
          label={`${inv.spaceName} — ${spaceCopy.inviteFrom} ${inv.fromEmail}`}
          onPress={() => void onAccept(inv)}
        />
      ))}
    </>
  );
};

const SpaceRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]} onPress={onPress}>
    <Text style={styles.rowLabel}>{label}</Text>
  </Pressable>
);

type AndroidPickerProps = {
  visible: boolean;
  onClose: () => void;
  subDialog: SubDialog;
  setSubDialog: (d: SubDialog) => void;
  promptValue: string;
  setPromptValue: (v: string) => void;
  handleCreateSubmit: () => void;
  creatingSpace: boolean;
  resetSubDialog: () => void;
};

const AndroidPicker = ({
  visible,
  onClose,
  subDialog,
  setSubDialog,
  promptValue,
  setPromptValue,
  handleCreateSubmit,
  creatingSpace,
  resetSubDialog,
}: AndroidPickerProps) => {
  const { spaces, switchSpace, profile } = useSpace();
  const { pendingInvites } = useInvites();
  const items = spaces.map((space) => ({
    text: buildLabel(space.name, space.id === profile?.personalSpaceId),
    onPress: () => {
      switchSpace(space.id);
      onClose();
    },
  }));
  const inviteItems = pendingInvites.map((inv) => ({
    text: `${inv.spaceName} — ${spaceCopy.inviteFrom} ${inv.fromEmail}`,
    onPress: () => void onClose(),
  }));
  const headerRight = (
    <Pressable onPress={() => setSubDialog("create")} hitSlop={8}>
      <MaterialCommunityIcons name="plus" size={22} color={homeColors.buttonText} />
    </Pressable>
  );

  return (
    <>
      <ActionMenu
        visible={visible && subDialog === "none" && !creatingSpace}
        title={spaceCopy.switchSpace}
        items={[...items, ...inviteItems]}
        onClose={onClose}
        headerColor={homeColors.primary}
        headerTextColor={homeColors.primaryForeground}
        headerRight={headerRight}
      />
      <TextPromptDialog
        visible={subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        disabled={creatingSpace}
        onChange={setPromptValue}
        onCancel={resetSubDialog}
        onSubmit={handleCreateSubmit}
      />
      <Modal visible={creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sheetList: { flex: 1, minHeight: 0 },
  sheetListContent: { paddingBottom: homeSpacing.sm, gap: homeSpacing.sm },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: homeSpacing.xs,
  },
  spaceName: { fontSize: 22, fontWeight: "700", color: homeColors.text, flex: 1 },
  actions: { gap: homeSpacing.sm },
  buttonRow: { flexDirection: "row", gap: homeSpacing.sm },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: homeColors.muted,
    marginTop: homeSpacing.xs,
    marginBottom: homeSpacing.xs,
  },
  rowMain: {
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
  rowLabel: { flex: 1, fontSize: 16, color: homeColors.text },
});
