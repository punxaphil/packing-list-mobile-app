import {
  type AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithApple } from "~/services/appleAuth.ts";
import { homeColors } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { authStyles } from "./authStyles.ts";
import { EmailForm } from "./EmailForm.tsx";

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password",
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  "auth/account-exists-with-different-credential": "This email is already linked to Apple sign-in. Use that instead",
};

const friendlyAuthError = (e: unknown, fallback: string): string =>
  FRIENDLY_AUTH_ERRORS[(e as AuthError)?.code] ?? fallback;

export function Login() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleApple = async () => {
    setError("");
    try {
      await signInWithApple();
    } catch (e) {
      setError(friendlyAuthError(e, "Apple sign-in failed"));
    }
  };

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(getAuth(), email.trim(), password);
    } catch (e) {
      setError(friendlyAuthError(e, "Login failed"));
    }
  };

  const handleRegister = async () => {
    setError("");
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(user);
    } catch (e) {
      setError(friendlyAuthError(e, "Registration failed"));
    }
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <View style={authStyles.container}>
        <Text style={authStyles.title}>Welcome to Packsy</Text>
        <Button variant="apple" label="Sign in with Apple" onPress={() => void handleApple()} />
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        {!showEmail && (
          <Pressable onPress={() => setShowEmail(true)}>
            <Text style={styles.emailToggle}>Sign in with email instead</Text>
          </Pressable>
        )}
        {showEmail && (
          <EmailForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            {...{ email, setEmail, password, setPassword }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emailToggle: {
    color: homeColors.muted,
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
