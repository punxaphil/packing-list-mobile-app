import { useCallback, useEffect, useMemo, useState } from "react";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { fetchMemberData, type MemberData } from "~/services/spaceDatabase.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { useSpaceManagement } from "../space/useSpaceManagement.ts";
import type { MemberInfo } from "./memberInfo.ts";
import type { SpaceSheetSubDialog } from "./SpaceSheetContent.tsx";

export function useSpaceSheet(onClose: () => void) {
  const { spaces, spaceId, activeSpace, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite } = useInvites();
  const [subDialog, setSubDialog] = useState<SpaceSheetSubDialog>("none");
  const [promptValue, setPromptValue] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [memberData, setMemberData] = useState<MemberData>({
    imagesByEmail: {},
    emailById: {},
  });
  const mgmt = useSpaceManagement(onClose);

  useEffect(() => {
    const allIds = [...new Set(spaces.flatMap((s) => s.members))];
    if (!allIds.length) return;
    void fetchMemberData(allIds).then(setMemberData);
  }, [spaces]);

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

  const memberInfoBySpaceId = useMemo(() => {
    const result: Record<string, MemberInfo[]> = {};
    for (const space of spaces) {
      const spaceOwnerEmail = memberData.emailById[space.ownerId]?.toLowerCase();
      const sorted = [...space.memberEmails].sort((a, b) => {
        if (a.toLowerCase() === spaceOwnerEmail) return -1;
        if (b.toLowerCase() === spaceOwnerEmail) return 1;
        return 0;
      });
      result[space.id] = sorted.map((email) => ({
        email,
        imageUrl: memberData.imagesByEmail[email],
      }));
    }
    return result;
  }, [spaces, memberData]);

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
