import { Alert } from "react-native";
import { signOutUser } from "~/navigation/signOut.ts";
import { reactivateAccount } from "~/services/spaceDatabase.ts";
import type { UserProfile } from "~/types/UserProfile.ts";
import { resolveValidSpaceId } from "./useSpaces.ts";

const TITLE = "Account pending deletion";
const BODY = "This account has been marked for deletion. Would you like to reactivate it?";
const REACTIVATE = "Reactivate";
const SIGN_OUT = "Sign Out";

export function showPendingDeletionAlert(
  userId: string,
  stored: string,
  profile: UserProfile,
  setReady: (v: boolean) => void,
  setActiveSpaceId: (id: string) => void
) {
  Alert.alert(TITLE, BODY, [
    { text: SIGN_OUT, style: "cancel", onPress: () => void signOutUser() },
    {
      text: REACTIVATE,
      onPress: () => {
        const resume = async () => {
          await reactivateAccount(userId);
          const validId = resolveValidSpaceId(stored, profile);
          if (validId !== stored) setActiveSpaceId(validId);
          setReady(true);
        };
        resume().catch(console.error);
      },
    },
  ]);
}
