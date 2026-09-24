import { type AuthError, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { authStyles } from "./authStyles.ts";

const resetErrorKey = (error: unknown) => {
  const code = (error as AuthError)?.code;
  if (code === "auth/user-not-found") return "auth.resetSent";
  if (code === "auth/invalid-email") return "auth.errors.invalidEmail";
  if (code === "auth/too-many-requests") return "auth.errors.tooManyRequests";
  return "auth.resetFailed";
};

async function requestPasswordReset(address: string) {
  try {
    await sendPasswordResetEmail(getAuth(), address);
    return "auth.resetSent";
  } catch (error) {
    return resetErrorKey(error);
  }
}

export function PasswordResetButton({ email, disabled = false }: { email: string; disabled?: boolean }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({ email: "", key: "" });

  const handleReset = async () => {
    const address = email.trim();
    if (!address) {
      setFeedback({ email, key: "auth.errors.invalidEmail" });
      return;
    }
    setPending(true);
    setFeedback({ email, key: await requestPasswordReset(address) });
    setPending(false);
  };

  return (
    <View style={styles.container}>
      <Button
        label={t("auth.forgotPassword")}
        variant="ghost"
        disabled={pending || disabled}
        onPress={() => void handleReset()}
      />
      {feedback.email === email && feedback.key ? (
        <Text style={feedback.key === "auth.resetSent" ? styles.success : authStyles.error}>{t(feedback.key)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: homeSpacing.sm },
  success: { color: homeColors.muted, textAlign: "center", fontSize: 14 },
});
