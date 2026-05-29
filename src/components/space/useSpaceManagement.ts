import { useCallback } from "react";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getUserId } from "~/services/firebase.ts";
import {
  deleteSpace,
  findUserIdByEmail,
  removeEmailFromSpace,
  removeSpaceFromProfile,
  updateSpaceName,
} from "~/services/spaceDatabase.ts";
import { finalizeUserRemoval, unassignUserFromPackItems } from "~/services/userMemberSync.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

export function useSpaceManagement(onBack: () => void) {
  const { activeSpace, spaceId, profile, switchSpace, suppressRemovalAlert } = useSpace();
  const { sendInvite } = useInvites();
  const currentEmail = profile?.email ?? "";
  const isPersonalSpace = spaceId === profile?.personalSpaceId;
  const isOwner = activeSpace?.ownerId === profile?.id;

  const rename = useCallback(
    async (name: string) => {
      await updateSpaceName(spaceId, name);
    },
    [spaceId]
  );

  const invite = useCallback(
    async (email: string) => {
      const exists = await findUserIdByEmail(email);
      if (!exists) return false;
      await sendInvite(email);
      return true;
    },
    [sendInvite]
  );

  const removeUser = useCallback(
    async (email: string) => {
      if (!activeSpace) return;
      const userId = await findUserIdByEmail(email);
      if (!userId) {
        await removeEmailFromSpace(spaceId, email);
        return;
      }
      await unassignUserFromPackItems(spaceId, userId);
      await finalizeUserRemoval(spaceId, userId, email);
    },
    [activeSpace, spaceId]
  );

  const switchToFallbackSpace = useCallback(() => {
    if (!profile) return;
    const fallback = profile.spaceIds.find((id) => id !== spaceId) ?? profile.personalSpaceId;
    switchSpace(fallback);
  }, [profile, spaceId, switchSpace]);

  const leave = useCallback(async () => {
    const userId = getUserId();
    suppressRemovalAlert.current = true;
    await unassignUserFromPackItems(spaceId, userId);
    await finalizeUserRemoval(spaceId, userId, currentEmail);
    switchToFallbackSpace();
    onBack();
  }, [spaceId, currentEmail, onBack, switchToFallbackSpace, suppressRemovalAlert]);

  const getDeleteError = useCallback(() => {
    if (!activeSpace) return;
    if (activeSpace.memberEmails.length > 1) {
      return SPACE_MGMT_COPY.cannotDeleteHasUsers;
    }
  }, [activeSpace]);

  const deleteCurrentSpace = useCallback(async () => {
    const userId = getUserId();
    suppressRemovalAlert.current = true;
    await deleteSpace(spaceId);
    await removeSpaceFromProfile(userId, spaceId);
    switchToFallbackSpace();
    onBack();
  }, [spaceId, onBack, switchToFallbackSpace, suppressRemovalAlert]);

  const confirmDelete = useCallback(() => {
    const error = getDeleteError();
    if (error) {
      showActionSheet(error, [{ text: SPACE_MGMT_COPY.cancel, style: "cancel" }]);
      return;
    }
    showActionSheet(SPACE_MGMT_COPY.confirmDelete, [
      { text: SPACE_MGMT_COPY.confirm, style: "destructive", onPress: deleteCurrentSpace },
      { text: SPACE_MGMT_COPY.cancel, style: "cancel" },
    ]);
  }, [getDeleteError, deleteCurrentSpace]);

  return {
    rename,
    invite,
    removeUser,
    leave,
    confirmDelete,
    currentEmail,
    isPersonalSpace,
    isOwner,
  };
}
