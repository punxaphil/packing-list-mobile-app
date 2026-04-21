import { useState } from "react";
import { Alert } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { markAccountForDeletion } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import { Button } from "../shared/Button.tsx";

const COPY = {
  label: "Delete Account",
  title: "Delete account",
  body: "This will mark your account for deletion. You will be signed out and unable to log back in.",
  confirm: "Delete",
  cancel: "Cancel",
  sharedSpacesTitle: "Cannot delete account",
  errorTitle: "Could not delete account",
  errorBody: "Something went wrong. Please try again.",
};

const getSharedOwnedSpaces = (spaces: Space[], userId: string) =>
  spaces.filter((s) => s.ownerId === userId && s.members.length > 1);

const sharedSpacesBody = (names: string[]) =>
  `Remove all other members from these spaces before deleting your account:\n\n${names.join("\n")}`;

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
      Alert.alert(COPY.errorTitle, COPY.errorBody);
    } finally {
      setDeleting(false);
    }
  };

  const handlePress = () => {
    if (!profile) return;
    const shared = getSharedOwnedSpaces(spaces, profile.id);
    if (shared.length > 0) {
      Alert.alert(COPY.sharedSpacesTitle, sharedSpacesBody(shared.map((s) => s.name)));
      return;
    }
    Alert.alert(COPY.title, COPY.body, [
      { text: COPY.cancel, style: "cancel" },
      { text: COPY.confirm, style: "destructive", onPress: () => void deleteAccount() },
    ]);
  };

  return <Button label={COPY.label} onPress={handlePress} variant="danger" centered disabled={deleting} />;
}
