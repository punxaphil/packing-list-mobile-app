import { getAuth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeColors } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { authStyles } from "./authStyles.ts";

export function VerifyEmail({ recheckUser }: { recheckUser: () => void }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const user = getAuth().currentUser;

  const handleResend = async () => {
    setError("");
    setMessage("");
    if (!user) return;
    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent!");
    } catch {
      setError("Failed to send email. Try again later.");
    }
  };

  const handleCheck = async () => {
    setError("");
    setMessage("");
    if (!user) return;
    await user.reload();
    if (getAuth().currentUser?.emailVerified) {
      recheckUser();
    } else {
      setError("Email not yet verified. Check your inbox.");
    }
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <View style={authStyles.container}>
        <Text style={authStyles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to {user?.email}.{"\n"}
          Check your inbox (and spam folder) and tap the link.
        </Text>
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <Button label="I've verified my email" variant="primary" onPress={() => void handleCheck()} />
        <Button label="Resend verification email" onPress={() => void handleResend()} />
        <Button label="Sign out" variant="ghost" onPress={() => void getAuth().signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: homeColors.muted,
    lineHeight: 22,
  },
  success: {
    color: homeColors.primaryStrong,
    textAlign: "center",
    fontSize: 14,
  },
});
