import { getAuth, OAuthProvider, signInWithPopup } from "firebase/auth";

/**
 * Web implementation of Apple Sign-In.
 * Uses Firebase OAuthProvider with popup for web.
 */
export const signInWithApple = async () => {
  const auth = getAuth();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");

  try {
    await signInWithPopup(auth, provider);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "auth/popup-closed-by-user") {
      throw new Error("Apple sign-in was cancelled");
    }
    throw error;
  }
};
