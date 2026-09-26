import { useEffect, useState } from "react";
import { UserList } from "../space/UserList.tsx";
import { ActionSheetHost } from "./ActionSheetHost.tsx";
import { SpaceSheetDialog } from "./SpaceSheetDialog.tsx";
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
import { homeColors } from "./theme.ts";
import type { useSpaceSheet } from "./useSpaceSheet.ts";

export type SpaceSheetSubDialog = "none" | "create" | "rename" | "invite";

type Props = {
  visible: boolean;
  onClose: () => void;
  sheet: ReturnType<typeof useSpaceSheet>;
};

export const SpaceSheetContent = ({ visible, onClose, sheet: s }: Props) => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  useEffect(() => {
    if (!visible) setActionSheetOpen(false);
  }, [visible]);

  return (
    <>
      <SpaceSheetDialog visible={visible && !s.creatingSpace && !actionSheetOpen} onClose={onClose}>
        <div className="space-sheet-dialog-content">
          <SpaceSheetHeader title={spaceCopy.spacesTitle} onClose={onClose} />
          <div className="space-sheet-dialog-scroll">
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
                <h3 className="space-sheet-section-title" style={{ color: homeColors.muted }}>
                  {spaceCopy.switchSpace}
                </h3>
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
          </div>
        </div>
      </SpaceSheetDialog>
      {visible && <ActionSheetHost onVisibilityChange={setActionSheetOpen} />}
      <SpaceSheetDialogs sheet={s} />
    </>
  );
};
