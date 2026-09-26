import i18next from "i18next";
import { signOutUser } from "~/navigation/signOut.ts";
import { reactivateAccount } from "~/services/spaceDatabase.ts";
import type { UserProfile } from "~/types/UserProfile.ts";
import { resolveValidSpaceId } from "./useSpaces.ts";

export function showPendingDeletionAlert(
  userId: string,
  stored: string,
  profile: UserProfile,
  setReady: (v: boolean) => void,
  setActiveSpaceId: (id: string) => void
) {
  if (!window.confirm(`${i18next.t("common.pendingDeletionTitle")}\n${i18next.t("common.pendingDeletionBody")}`)) {
    void signOutUser();
    return;
  }
  const resume = async () => {
    await reactivateAccount(userId);
    const validId = resolveValidSpaceId(stored, profile);
    if (validId !== stored) setActiveSpaceId(validId);
    setReady(true);
  };
  resume().catch(console.error);
}
