import { getAuth } from "firebase/auth";
import { clearSelectedId } from "./selectionState.ts";
import { clearSpaceState } from "./spaceState.ts";

export async function signOutUser() {
  await getAuth().signOut();
  clearSelectedId();
  await clearSpaceState();
}
