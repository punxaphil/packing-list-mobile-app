import { useCallback } from "react";
import { Alert } from "react-native";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getUserId } from "~/services/firebase.ts";
import {
  deleteSpace,
  leaveSpace,
  removeMemberFromSpace,
  removeSpaceFromProfile,
  updateSpaceName,
} from "~/services/spaceDatabase.ts";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

export function useSpaceManagement(onBack: () => void) {
  const { activeSpace, spaceId, profile, switchSpace, suppressRemovalAlert } = useSpace();
  const { sendInvite } = useInvites();
  const currentEmail = profile?.email ?? "";
  const isPersonalSpace = spaceId === profile?.personalSpaceId;

  const rename = useCallback(
    async (name: string) => {
      await updateSpaceName(spaceId, name);
    },
    [spaceId]
  );

  const invite = useCallback(
    async (email: string) => {
      await sendInvite(email);
    },
    [sendInvite]
  );

  const removeUser = useCallback(
    async (email: string) => {
      if (!activeSpace) return;
      const userId = findUserIdByEmail(activeSpace.members, activeSpace.memberEmails, email);
      await removeMemberFromSpace(spaceId, userId ?? "", email);
      if (userId) await removeSpaceFromProfile(userId, spaceId);
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
    await leaveSpace(spaceId, userId, currentEmail);
    await removeSpaceFromProfile(userId, spaceId);
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
      Alert.alert(SPACE_MGMT_COPY.delete, error);
      return;
    }
    Alert.alert(SPACE_MGMT_COPY.delete, SPACE_MGMT_COPY.confirmDelete, [
      { text: SPACE_MGMT_COPY.cancel, style: "cancel" },
      {
        text: SPACE_MGMT_COPY.confirm,
        style: "destructive",
        onPress: deleteCurrentSpace,
      },
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
  };
}

function findUserIdByEmail(members: string[], memberEmails: string[], email: string): string | undefined {
  const index = memberEmails.indexOf(email);
  return index >= 0 ? members[index] : undefined;
}
