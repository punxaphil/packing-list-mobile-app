import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { fetchMemberData, type MemberData } from "~/services/spaceDatabase.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { useSpaceManagement } from "../space/useSpaceManagement.ts";
import type { SpaceSheetSubDialog } from "./SpaceSheetAndroid.tsx";
import { showNativeTextPrompt } from "./showNativeTextPrompt.ts";
import { spaceCopy } from "./spaceCopy.ts";

export function useSpaceSheet(onClose: () => void) {
  const { spaces, spaceId, activeSpace, switchSpace, createNewSpace, profile } = useSpace();
  const { pendingInvites, acceptInvite } = useInvites();
  const mgmt = useSpaceManagement(onClose);
  const [subDialog, setSubDialog] = useState<SpaceSheetSubDialog>("none");
  const [promptValue, setPromptValue] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [memberData, setMemberData] = useState<MemberData>({ imagesByEmail: {}, emailById: {} });

  useEffect(() => {
    const ownerIds = spaces.map((s) => s.ownerId).filter(Boolean);
    const activeMembers = activeSpace?.members ?? [];
    const allIds = [...new Set([...activeMembers, ...ownerIds])];
    if (!allIds.length) return;
    void fetchMemberData(allIds).then(setMemberData);
  }, [activeSpace?.members, spaces]);

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

  const handleRename = useCallback(
    () =>
      showNativeTextPrompt({
        title: spaceCopy.renamePrompt,
        confirmLabel: spaceCopy.renameConfirm,
        value: activeSpace?.name ?? "",
        onSubmit: (t) => {
          if (t.trim()) void mgmt.rename(t.trim());
        },
      }),
    [activeSpace?.name, mgmt]
  );

  const handleInvite = useCallback(
    () =>
      showNativeTextPrompt({
        title: spaceCopy.invitePrompt,
        confirmLabel: spaceCopy.inviteConfirm,
        keyboardType: "email-address",
        onSubmit: async (t) => {
          if (!t.trim()) return;
          await mgmt.invite(t.trim());
          Alert.alert(spaceCopy.inviteSent);
        },
      }),
    [mgmt]
  );

  const otherSpaces = spaces.filter((s) => s.id !== spaceId);

  const imagesByEmail = memberData.imagesByEmail;
  const ownerEmail = activeSpace ? memberData.emailById[activeSpace.ownerId] : undefined;

  const ownerInfoBySpaceId = useMemo(() => {
    const result: Record<string, { email: string; imageUrl?: string }> = {};
    for (const space of spaces) {
      const email = memberData.emailById[space.ownerId];
      if (email) result[space.id] = { email, imageUrl: memberData.imagesByEmail[email] };
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
    ownerInfoBySpaceId,
    resetSubDialog,
    handleAccept,
    handleCreate,
    handleCreateSubmit,
    handleRename,
    handleInvite,
    otherSpaces,
  };
}
