import type { CSSProperties } from "react";
import "@mdi/font/css/materialdesignicons.css";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { Button } from "../shared/Button.tsx";
import { MemberAvatars } from "./MemberAvatars.tsx";
import type { MemberInfo } from "./memberInfo.ts";
import { spaceCopy } from "./spaceCopy.ts";
import { homeColors } from "./theme.ts";

export { SpaceSheetHeader } from "./SpaceSheetHeader.tsx";

import "./spaceSheetParts.css";

export const SpaceNameRow = ({ name, onRename }: { name: string; onRename: () => void }) => (
  <div className="space-name-row">
    <span title={name} style={{ color: homeColors.text }}>
      {name}
    </span>
    <button
      type="button"
      className="space-sheet-icon"
      onClick={onRename}
      aria-label={spaceCopy.renamePrompt}
      title={spaceCopy.renamePrompt}
      style={{ color: homeColors.muted }}
    >
      <span className="mdi mdi-pencil-outline" aria-hidden="true" />
    </button>
  </div>
);

type SpaceActionsProps = {
  onInvite: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isPersonal: boolean;
  isOwner: boolean;
};

export const SpaceActions = ({ onInvite, onLeave, onDelete, isPersonal, isOwner }: SpaceActionsProps) => (
  <div className="space-sheet-actions">
    {isOwner && <Button label={spaceCopy.inviteUser} onPress={onInvite} />}
    {!isPersonal && !isOwner && <Button label={spaceCopy.leaveSpace} onPress={onLeave} variant="danger" />}
    {!isPersonal && isOwner && <Button label={spaceCopy.deleteSpace} onPress={onDelete} variant="danger" />}
  </div>
);

export const CreateSpaceButton = ({ onPress }: { onPress: () => void }) => (
  <Button label={spaceCopy.createSpace} onPress={onPress} />
);

export const InviteSection = ({
  invites,
  onAccept,
}: {
  invites: SpaceInvite[];
  onAccept: (i: SpaceInvite) => void;
}) => {
  if (!invites.length) return null;
  return (
    <>
      <h3 className="space-sheet-section-title" style={{ color: homeColors.muted }}>
        {spaceCopy.pendingInvites}
      </h3>
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

export const SpaceRow = ({ label, onPress, members }: SpaceRowProps) => (
  <button
    type="button"
    className="space-sheet-row"
    style={
      {
        color: homeColors.text,
        "--space-row-background": homeColors.rowBg,
        "--space-row-pressed": homeColors.rowPressed,
      } as CSSProperties
    }
    onClick={onPress}
  >
    <span className="space-sheet-row-label">{label}</span>
    {members && <MemberAvatars members={members} />}
  </button>
);

type SpaceRowProps = {
  label: string;
  onPress: () => void;
  members?: MemberInfo[];
};
