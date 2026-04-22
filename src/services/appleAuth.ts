import { appleAuth } from "@invertase/react-native-apple-authentication";
import { getAuth, OAuthProvider, signInWithCredential, updateProfile } from "firebase/auth";

export async function signInWithApple() {
  const appleResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  const { identityToken, nonce, fullName } = appleResponse;
  if (!identityToken) throw new Error("Apple sign-in failed: no identity token");
  const credential = new OAuthProvider("apple.com").credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const { user } = await signInWithCredential(getAuth(), credential);
  const first = fullName?.givenName?.trim() ?? "";
  const last = fullName?.familyName?.trim() ?? "";
  if ((first || last) && !user.displayName) {
    await updateProfile(user, { displayName: [first, last].filter(Boolean).join("|") });
  }
}
