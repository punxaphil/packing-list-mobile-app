import i18next from "i18next";
import { useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { markAccountForDeletion } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import { commonCopy } from "../home/copy.ts";
import { Button } from "../shared/Button.tsx";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { showProfileAlert } from "./profileAlerts.ts";
import { profileCopy } from "./profileCopy.ts";

const getSharedOwnedSpaces = (spaces: Space[], userId: string) =>
  spaces.filter((s) => s.ownerId === userId && s.members.length > 1);

const sharedSpacesBody = (names: string[]) => i18next.t("profile.deleteAccountSharedBody", { names: names.join("\n") });

export function DeleteAccountButton({ onSignOut }: { onSignOut: () => void }) {
  const { spaces, profile } = useSpace();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const deleteAccount = async () => {
    if (!profile) return;
    setConfirming(false);
    setDeleting(true);
    try {
      await markAccountForDeletion(profile.id);
      onSignOut();
    } catch {
      showProfileAlert(profileCopy.deleteAccountErrorTitle, profileCopy.deleteAccountErrorBody);
    } finally {
      setDeleting(false);
    }
  };

  const handlePress = () => {
    if (!profile) return;
    const shared = getSharedOwnedSpaces(spaces, profile.id);
    if (shared.length > 0) {
      showProfileAlert(profileCopy.deleteAccountCannotTitle, sharedSpacesBody(shared.map((s) => s.name)));
      return;
    }
    setConfirming(true);
  };

  return (
    <>
      <Button label={profileCopy.deleteAccount} onPress={handlePress} variant="danger" disabled={deleting} flex />
      <DialogShell
        visible={confirming}
        title={profileCopy.deleteAccountTitle}
        onClose={() => setConfirming(false)}
        actions={
          <DialogActions
            cancelLabel={commonCopy.cancel}
            confirmLabel={profileCopy.deleteAccountConfirm}
            onCancel={() => setConfirming(false)}
            onConfirm={() => void deleteAccount()}
            disabled={deleting}
          />
        }
      >
        <p>{profileCopy.deleteAccountBody}</p>
      </DialogShell>
    </>
  );
}
