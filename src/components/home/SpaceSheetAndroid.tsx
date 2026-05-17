import { Modal, Pressable, ScrollView, Text } from "react-native";
import { UserList } from "../space/UserList.tsx";
import { SpaceSheetDialogs } from "./SpaceSheetDialogs.tsx";
import {
  AndroidSheetHeader,
  CreateSpaceButton,
  InviteSection,
  SpaceActions,
  SpaceNameRow,
  SpaceRow,
} from "./SpaceSheetParts.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { androidSheetStyles, spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import type { useSpaceSheet } from "./useSpaceSheet.ts";

export type SpaceSheetSubDialog = "none" | "create" | "rename" | "invite";

type Props = {
  visible: boolean;
  onClose: () => void;
  sheet: ReturnType<typeof useSpaceSheet>;
};

export const SpaceSheetAndroid = ({ visible, onClose, sheet: s }: Props) => (
  <>
    <Modal
      visible={visible && s.subDialog === "none" && !s.creatingSpace}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={androidSheetStyles.backdrop} onPress={onClose}>
        <Pressable style={androidSheetStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <AndroidSheetHeader title={spaceCopy.spacesTitle} onClose={onClose} />
          <ScrollView style={styles.sheetListAndroid} contentContainerStyle={styles.sheetListContent}>
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
    </Modal>
    <SpaceSheetDialogs sheet={s} />
  </>
);
