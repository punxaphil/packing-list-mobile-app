import { Modal, Platform, ScrollView, Text } from "react-native";
import { AppLoadingState } from "../shared/AppLoadingState.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { UserList } from "../space/UserList.tsx";
import { SpaceSheetAndroid } from "./SpaceSheetAndroid.tsx";
import {
  buildLabel,
  CreateSpaceButton,
  InviteSection,
  SpaceActions,
  SpaceNameRow,
  SpaceRow,
} from "./SpaceSheetParts.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { useSpaceSheet } from "./useSpaceSheet.ts";

export const SpaceSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const s = useSpaceSheet(onClose);

  if (Platform.OS !== "ios") {
    return <SpaceSheetAndroid visible={visible} onClose={onClose} sheet={s} />;
  }

  return (
    <>
      <PageSheet
        visible={visible && !s.creatingSpace && s.subDialog !== "create"}
        title={spaceCopy.spacesTitle}
        onClose={onClose}
        scrollable={false}
      >
        <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
          <SpaceNameRow name={s.activeSpace?.name ?? ""} onRename={s.handleRename} isOwner={s.mgmt.isOwner} />
          {s.activeSpace && (
            <UserList
              emails={s.activeSpace.memberEmails}
              onRemove={s.mgmt.removeUser}
              currentEmail={s.mgmt.currentEmail}
              imagesByEmail={s.imagesByEmail}
              isOwner={s.mgmt.isOwner}
            />
          )}
          <SpaceActions
            onInvite={s.handleInvite}
            onLeave={s.mgmt.leave}
            onDelete={s.mgmt.confirmDelete}
            isPersonal={s.mgmt.isPersonalSpace}
            isOwner={s.mgmt.isOwner}
          />
          <InviteSection invites={s.pendingInvites} onAccept={s.handleAccept} />
          {s.otherSpaces.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{spaceCopy.switchSpace}</Text>
              {s.otherSpaces.map((space) => (
                <SpaceRow
                  key={space.id}
                  label={buildLabel(
                    space.name,
                    space.id === s.profile?.personalSpaceId,
                    space.ownerId === s.profile?.id
                  )}
                  onPress={() => {
                    s.switchSpace(space.id);
                    onClose();
                  }}
                />
              ))}
            </>
          )}
          <CreateSpaceButton onPress={() => s.setSubDialog("create")} />
        </ScrollView>
      </PageSheet>
      <TextPromptDialog
        visible={s.subDialog === "create"}
        title={spaceCopy.createSpacePrompt}
        confirmLabel={spaceCopy.createSpaceConfirm}
        value={s.promptValue}
        placeholder={spaceCopy.createSpacePlaceholder}
        disabled={s.creatingSpace}
        onChange={s.setPromptValue}
        onCancel={s.resetSubDialog}
        onSubmitText={(t) => {
          const v = t.trim();
          if (v && !s.creatingSpace) void s.handleCreate(v);
        }}
        onSubmit={s.handleCreateSubmit}
      />
      <Modal visible={s.creatingSpace} transparent animationType="fade">
        <AppLoadingState />
      </Modal>
    </>
  );
};
