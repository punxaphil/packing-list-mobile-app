import { useCallback, useState } from "react";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { useSpaceManagement } from "../space/useSpaceManagement.ts";
import type { SpaceSheetSubDialog } from "./SpaceSheetContent.tsx";
import { useSpaceMemberInfo } from "./useSpaceMemberInfo.ts";

export function useSpaceSheet(onClose: () => void) {
  const { spaces, spaceId, activeSpace, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite } = useInvites();
  const [subDialog, setSubDialog] = useState<SpaceSheetSubDialog>("none");
  const [promptValue, setPromptValue] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const { memberData, memberInfoBySpaceId } = useSpaceMemberInfo(spaces);
  const mgmt = useSpaceManagement(onClose);

  const resetSubDialog = useCallback(() => {
    setPromptValue("");
    setSubDialog("none");
  }, []);

  const handleAccept = useCallback(
    async (invite: SpaceInvite) => {
      await acceptInvite(invite);
      switchSpace(invite.spaceId);
      onClose();
    },
    [acceptInvite, switchSpace, onClose]
  );

  const handleCreate = useCallback(
    async (name: string) => {
      setSubDialog("none");
      setCreatingSpace(true);
      try {
        const space = await createNewSpace(name);
        switchSpace(space.id);
        setPromptValue("");
        onClose();
      } finally {
        setCreatingSpace(false);
      }
    },
    [createNewSpace, switchSpace, onClose]
  );

  const handleCreateSubmit = useCallback(() => {
    const trimmed = promptValue.trim();
    if (!trimmed || creatingSpace) return;
    void handleCreate(trimmed);
  }, [promptValue, creatingSpace, handleCreate]);

  const handleRename = useCallback(() => {
    setPromptValue(activeSpace?.name ?? "");
    setSubDialog("rename");
  }, [activeSpace?.name]);

  const handleInvite = useCallback(() => {
    setPromptValue("");
    setSubDialog("invite");
  }, []);

  const otherSpaces = spaces.filter((s) => s.id !== spaceId);

  const imagesByEmail = memberData.imagesByEmail;
  const ownerEmail = activeSpace ? memberData.emailById[activeSpace.ownerId] : undefined;

  return {
    spaces,
    spaceId,
    activeSpace,
    profile,
    switchSpace,
    pendingInvites,
    mgmt,
    subDialog,
    setSubDialog,
    promptValue,
    setPromptValue,
    creatingSpace,
    imagesByEmail,
    ownerEmail,
    memberInfoBySpaceId,
    resetSubDialog,
    handleAccept,
    handleCreate,
    handleCreateSubmit,
    handleRename,
    handleInvite,
    otherSpaces,
  };
}
