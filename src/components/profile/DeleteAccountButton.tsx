import i18next from "i18next";
import { useState } from "react";
import { Alert } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { markAccountForDeletion } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import { commonCopy } from "../home/copy.ts";
import { Button } from "../shared/Button.tsx";
import { profileCopy } from "./profileCopy.ts";

const getSharedOwnedSpaces = (spaces: Space[], userId: string) =>
  spaces.filter((s) => s.ownerId === userId && s.members.length > 1);

const sharedSpacesBody = (names: string[]) => i18next.t("profile.deleteAccountSharedBody", { names: names.join("\n") });

export function DeleteAccountButton({ onSignOut }: { onSignOut: () => void }) {
  const { spaces, profile } = useSpace();
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      await markAccountForDeletion(profile.id);
      onSignOut();
    } catch {
      Alert.alert(profileCopy.deleteAccountErrorTitle, profileCopy.deleteAccountErrorBody);
    } finally {
      setDeleting(false);
    }
  };

  const handlePress = () => {
    if (!profile) return;
    const shared = getSharedOwnedSpaces(spaces, profile.id);
    if (shared.length > 0) {
      Alert.alert(profileCopy.deleteAccountCannotTitle, sharedSpacesBody(shared.map((s) => s.name)));
      return;
    }
    Alert.alert(profileCopy.deleteAccountTitle, profileCopy.deleteAccountBody, [
      { text: commonCopy.cancel, style: "cancel" },
      { text: profileCopy.deleteAccountConfirm, style: "destructive", onPress: () => void deleteAccount() },
    ]);
  };

  return <Button label={profileCopy.deleteAccount} onPress={handlePress} variant="danger" disabled={deleting} flex />;
}
