import { getAuth } from "firebase/auth";
import { Navigation } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds.ts";
import { clearSelectedId } from "./selectionState.ts";
import { setSigningOut } from "./signOutState.ts";
import { clearSpaceState } from "./spaceState.ts";

export async function signOutUser() {
  setSigningOut(true);
  try {
    clearSelectedId();
    await clearSpaceState();
    await getAuth().signOut();
    Navigation.setRoot({ root: { component: { name: SCREEN_IDS.APP_ROOT } } });
  } finally {
    setSigningOut(false);
  }
}
