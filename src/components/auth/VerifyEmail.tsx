import { getAuth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signOutUser } from "~/navigation/signOut.ts";
import { Button } from "../shared/Button.tsx";
import { authTheme } from "./authStyles.ts";
import "./auth.css";

export function VerifyEmail({ recheckUser }: { recheckUser: () => void }) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const user = getAuth().currentUser;

  const handleResend = async () => {
    setError("");
    setMessage("");
    if (!user) return;
    try {
      await sendEmailVerification(user);
      setMessage(t("auth.verificationSent"));
    } catch {
      setError(t("auth.verificationSendFailed"));
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
      setError(t("auth.verificationPending"));
    }
  };

  return (
    <main className="auth-page" style={authTheme}>
      <div className="auth-container">
        <h1 className="auth-title">{t("auth.verifyEmail")}</h1>
        <p className="auth-subtitle">{t("auth.verificationIntro", { email: user?.email })}</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="auth-success" role="status">
            {message}
          </p>
        ) : null}
        <Button label={t("auth.verifiedEmail")} variant="primary" onPress={() => void handleCheck()} />
        <Button label={t("auth.resendVerification")} onPress={() => void handleResend()} />
        <Button label={t("profile.signOut")} variant="ghost" onPress={() => void signOutUser()} />
      </div>
    </main>
  );
}
