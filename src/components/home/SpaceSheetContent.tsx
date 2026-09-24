import { Modal, Pressable, ScrollView, Text } from "react-native";
import { UserList } from "../space/UserList.tsx";
import { ActionSheetHost } from "./ActionSheetHost.tsx";
import { SpaceSheetDialogs } from "./SpaceSheetDialogs.tsx";
import {
  CreateSpaceButton,
  InviteSection,
  SpaceActions,
  SpaceNameRow,
  SpaceRow,
  SpaceSheetHeader,
} from "./SpaceSheetParts.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { spaceModalStyles, spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import type { useSpaceSheet } from "./useSpaceSheet.ts";

export type SpaceSheetSubDialog = "none" | "create" | "rename" | "invite";

type Props = {
  visible: boolean;
  onClose: () => void;
  sheet: ReturnType<typeof useSpaceSheet>;
};

export const SpaceSheetContent = ({ visible, onClose, sheet: s }: Props) => (
  <>
    <Modal visible={visible && !s.creatingSpace} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={spaceModalStyles.backdrop} onPress={onClose}>
        <Pressable style={spaceModalStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <SpaceSheetHeader title={spaceCopy.spacesTitle} onClose={onClose} />
          <ScrollView style={styles.modalList} contentContainerStyle={styles.sheetListContent}>
            <SpaceNameRow name={s.activeSpace?.name ?? ""} onRename={s.handleRename} />
            {s.activeSpace && (
              <UserList
                emails={s.activeSpace.memberEmails}
                onRemove={s.mgmt.removeUser}
                currentEmail={s.mgmt.currentEmail}
                imagesByEmail={s.imagesByEmail}
                isOwner={s.mgmt.isOwner}
                ownerEmail={s.ownerEmail}
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
                    label={space.name}
                    members={s.memberInfoBySpaceId[space.id]}
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
        </Pressable>
      </Pressable>
      <ActionSheetHost />
    </Modal>
    <SpaceSheetDialogs sheet={s} />
  </>
);
