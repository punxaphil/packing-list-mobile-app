import {
  type AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithApple } from "~/services/appleAuth.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password",
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  "auth/account-exists-with-different-credential":
    "This email is already linked to Apple sign-in. Use that instead",
};

const friendlyAuthError = (e: unknown, fallback: string): string =>
  FRIENDLY_AUTH_ERRORS[(e as AuthError)?.code] ?? fallback;

export function useCurrentUser() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loggingIn, setLoggingIn] = useState(true);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      setUserId(user?.uid ?? "");
      setEmail(user?.email?.toLowerCase() ?? "");
      setLoggingIn(false);
    });

    return unsubscribe;
  }, []);

  return { userId, email, loggingIn };
}

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
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(friendlyAuthError(e, "Registration failed"));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to PackSmarter</Text>
        <Pressable
          style={styles.appleButton}
          onPress={() => void handleApple()}
        >
          <Text style={styles.appleButtonText}>
            {"\uF8FF"} Sign in with Apple
          </Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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

type EmailFormProps = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onLogin: () => void;
  onRegister: () => void;
};

function EmailForm({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onRegister,
}: EmailFormProps) {
  return (
    <View style={styles.emailSection}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        autoCapitalize="none"
        secureTextEntry
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]}
        onPress={onLogin}
      >
        <Text style={sheetButtonStyles.textNeutral}>Login</Text>
      </Pressable>
      <Pressable
        style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]}
        onPress={onRegister}
      >
        <Text style={sheetButtonStyles.textNeutral}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: homeColors.background },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: 32,
    gap: homeSpacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: homeColors.text,
    marginBottom: homeSpacing.md,
  },
  appleButton: {
    backgroundColor: "#000",
    borderRadius: homeRadius,
    paddingVertical: 14,
    alignItems: "center",
  },
  appleButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  emailToggle: {
    color: homeColors.muted,
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  emailSection: { gap: homeSpacing.sm },
  input: {
    width: "100%",
    borderColor: homeColors.border,
    borderWidth: 1,
    borderRadius: homeRadius,
    paddingVertical: 12,
    paddingHorizontal: homeSpacing.md,
  },

  error: { color: homeColors.danger, textAlign: "center", fontSize: 14 },
});
