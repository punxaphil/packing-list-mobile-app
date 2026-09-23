import { appleAuth, appleAuthAndroid } from "@invertase/react-native-apple-authentication";
import { getAuth, OAuthProvider, signInWithCredential, updateProfile } from "firebase/auth";
import { Platform } from "react-native";

const APPLE_SERVICE_ID = "se.kodsam.packsmarter.service";
const REDIRECT_URI = "https://packing-list-448814.firebaseapp.com/__/auth/handler";

function generateNonce(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function firebaseSignIn(idToken: string, rawNonce: string, first: string, last: string) {
  const credential = new OAuthProvider("apple.com").credential({ idToken, rawNonce });
  const { user } = await signInWithCredential(getAuth(), credential);
  if ((first || last) && !user.displayName) {
    await updateProfile(user, { displayName: [first, last].filter(Boolean).join("|") });
  }
}

async function signInWithAppleIOS() {
  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  if (!response.identityToken) throw new Error("Apple sign-in failed: no identity token");
  const first = response.fullName?.givenName?.trim() ?? "";
  const last = response.fullName?.familyName?.trim() ?? "";
  await firebaseSignIn(response.identityToken, response.nonce, first, last);
}

function configureAndroidAuth(rawNonce: string) {
  appleAuthAndroid.configure({
    clientId: APPLE_SERVICE_ID,
    redirectUri: REDIRECT_URI,
    responseType: appleAuthAndroid.ResponseType.ALL,
    scope: appleAuthAndroid.Scope.ALL,
    nonce: rawNonce,
  });
}

async function signInWithAppleAndroid() {
  const rawNonce = generateNonce();
  configureAndroidAuth(rawNonce);
  const response = await appleAuthAndroid.signIn();
  if (!response.id_token) throw new Error("Apple sign-in failed: no identity token");
  const first = response.user?.name?.firstName?.trim() ?? "";
  const last = response.user?.name?.lastName?.trim() ?? "";
  await firebaseSignIn(response.id_token, rawNonce, first, last);
}

export const signInWithApple = Platform.OS === "ios" ? signInWithAppleIOS : signInWithAppleAndroid;
