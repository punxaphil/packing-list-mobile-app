import { type AuthError, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../shared/Button.tsx";

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
    <div className="auth-form">
      <Button
        label={t("auth.forgotPassword")}
        variant="ghost"
        disabled={pending || disabled}
        onPress={() => void handleReset()}
      />
      {feedback.email === email && feedback.key ? (
        <p className={feedback.key === "auth.resetSent" ? "auth-success" : "auth-error"} role="status">
          {t(feedback.key)}
        </p>
      ) : null}
    </div>
  );
}
