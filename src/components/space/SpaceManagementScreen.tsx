import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getUserImagesByEmail } from "~/services/spaceDatabase.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";
import { SpaceMgmtDialogs } from "./SpaceMgmtDialogs.tsx";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";
import { UserList } from "./UserList.tsx";
import { useSpaceManagement } from "./useSpaceManagement.ts";

type SpaceManagementScreenProps = { onBack?: () => void; embeddedInSheet?: boolean };

export const SpaceManagementScreen = ({ onBack, embeddedInSheet = false }: SpaceManagementScreenProps) => {
  const { activeSpace } = useSpace();
  const mgmt = useSpaceManagement(onBack ?? (() => undefined));
  const [dialogState, setDialogState] = useState<"none" | "rename" | "invite" | "inviteSent">("none");
  const [imagesByEmail, setImagesByEmail] = useState<Record<string, string>>({});

  const memberIds = activeSpace?.members;

  useEffect(() => {
    if (!memberIds?.length) return;
    void getUserImagesByEmail(memberIds).then(setImagesByEmail);
  }, [memberIds]);

  if (!activeSpace) return null;

  return (
    <View style={[styles.container, embeddedInSheet && styles.sheetContainer]}>
      {!embeddedInSheet && onBack ? <Header onBack={onBack} /> : null}
      <View style={[styles.content, embeddedInSheet && styles.sheetContent]}>
        <SpaceNameRow name={activeSpace.name} onRename={() => setDialogState("rename")} />
        <UserList
          emails={activeSpace.memberEmails}
          onRemove={mgmt.removeUser}
          currentEmail={mgmt.currentEmail}
          imagesByEmail={imagesByEmail}
        />
        <ActionButtons
          onInvite={() => setDialogState("invite")}
          onLeave={mgmt.leave}
          onDelete={mgmt.confirmDelete}
          isPersonal={mgmt.isPersonalSpace}
        />
      </View>
      <SpaceMgmtDialogs
        dialogState={dialogState}
        setDialogState={setDialogState}
        currentName={activeSpace.name}
        onRename={mgmt.rename}
        onInvite={mgmt.invite}
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
    <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onInvite}>
      <Text style={sheetButtonStyles.textNeutral}>{SPACE_MGMT_COPY.invite}</Text>
    </Pressable>
    {!isPersonal && (
      <>
        <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onLeave}>
          <Text style={sheetButtonStyles.textNeutral}>{SPACE_MGMT_COPY.leave}</Text>
        </Pressable>
        <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineDanger]} onPress={onDelete}>
          <Text style={sheetButtonStyles.textDanger}>{SPACE_MGMT_COPY.delete}</Text>
        </Pressable>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.surface },
  sheetContainer: { backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: homeSpacing.md,
  },
  backButton: { minWidth: 60 },
  backText: { color: homeColors.muted, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: homeColors.text },
  placeholder: { minWidth: 60 },
  content: { flex: 1, paddingHorizontal: homeSpacing.lg, gap: homeSpacing.lg },
  sheetContent: { paddingTop: homeSpacing.sm, paddingBottom: homeSpacing.md },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spaceName: { fontSize: 22, fontWeight: "700", color: homeColors.text },
  renameLink: { fontSize: 14, fontWeight: "600", color: homeColors.muted },
  actions: { gap: homeSpacing.sm, marginTop: homeSpacing.md },
});
