import { appleAuth } from "@invertase/react-native-apple-authentication";
import { OAuthProvider, getAuth, signInWithCredential } from "firebase/auth";

export async function signInWithApple() {
  const appleResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  const { identityToken, nonce } = appleResponse;
  if (!identityToken)
    throw new Error("Apple sign-in failed: no identity token");
  const credential = new OAuthProvider("apple.com").credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  await signInWithCredential(getAuth(), credential);
}
