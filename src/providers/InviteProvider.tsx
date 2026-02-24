import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { getUserId } from "~/services/firebase.ts";
import {
  addMemberEmailToSpace,
  addMemberIdToSpace,
  addSpaceToProfile,
  createInvite,
  subscribeToPendingInvites,
  updateInviteStatus,
} from "~/services/spaceDatabase.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { InviteContext } from "./InviteContext.ts";
import { useSpace } from "./SpaceContext.ts";

type Props = { email: string; children: ReactNode };

export function InviteProvider({ email, children }: Props) {
  const { spaceId, activeSpace } = useSpace();
  const [pendingInvites, setPendingInvites] = useState<SpaceInvite[]>([]);

  useEffect(() => {
    if (!email) return;
    return subscribeToPendingInvites(email.toLowerCase(), setPendingInvites);
  }, [email]);

  const acceptInvite = useCallback(async (invite: SpaceInvite) => {
    const userId = getUserId();
    await updateInviteStatus(invite.id, "accepted");
    await addMemberIdToSpace(invite.spaceId, userId);
    await addSpaceToProfile(userId, invite.spaceId);
  }, []);

  const declineInvite = useCallback(async (invite: SpaceInvite) => {
    await updateInviteStatus(invite.id, "declined");
  }, []);

  const sendInvite = useCallback(
    async (toEmail: string) => {
      const normalizedEmail = toEmail.toLowerCase();
      await createInvite({
        spaceId,
        spaceName: activeSpace?.name ?? "",
        fromEmail: email.toLowerCase(),
        toEmail: normalizedEmail,
        status: "pending",
        createdAt: Date.now(),
      });
      await addMemberEmailToSpace(spaceId, normalizedEmail);
    },
    [spaceId, activeSpace, email]
  );

  const value = useMemo(
    () => ({ pendingInvites, acceptInvite, declineInvite, sendInvite }),
    [pendingInvites, acceptInvite, declineInvite, sendInvite]
  );

  return <InviteContext.Provider value={value}>{children}</InviteContext.Provider>;
}
