import { getAuth } from "firebase/auth";
import { clearSelectedId } from "./selectionState.ts";
import { setSigningOut } from "./signOutState.ts";
import { clearSpaceState } from "./spaceState.ts";

/**
 * Sign out user and reset to login screen.
 * Navigation reset is handled by App component detecting userId === null
 */
export async function signOutUser() {
  setSigningOut(true);
  try {
    clearSelectedId();
    await clearSpaceState();
    await getAuth().signOut();
    // App component will detect userId === null and reset navigation
  } finally {
    setSigningOut(false);
  }
}
