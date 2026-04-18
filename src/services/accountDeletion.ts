import { getFunctions, httpsCallable } from "firebase/functions";

type DeleteAccountResult = { ok: boolean };

const DELETE_ACCOUNT_FUNCTION = "deleteMyAccount";

export async function deleteMyAccount() {
  const callDelete = httpsCallable<unknown, DeleteAccountResult>(getFunctions(), DELETE_ACCOUNT_FUNCTION);
  await callDelete();
}
