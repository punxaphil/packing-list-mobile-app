import {
  type AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import i18next from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { authTheme } from "./authStyles.ts";
import { EmailForm } from "./EmailForm.tsx";
import "./auth.css";

const AUTH_ERROR_KEYS: Record<string, string> = {
  "auth/invalid-credential": "auth.errors.invalidCredential",
  "auth/user-not-found": "auth.errors.userNotFound",
  "auth/wrong-password": "auth.errors.wrongPassword",
  "auth/email-already-in-use": "auth.errors.emailAlreadyInUse",
  "auth/weak-password": "auth.errors.weakPassword",
  "auth/invalid-email": "auth.errors.invalidEmail",
  "auth/too-many-requests": "auth.errors.tooManyRequests",
  "auth/account-exists-with-different-credential": "auth.errors.existsWithDifferentCredential",
};

const friendlyAuthError = (e: unknown, fallbackKey: string): string => {
  const key = AUTH_ERROR_KEYS[(e as AuthError)?.code];
  return key ? i18next.t(key) : i18next.t(fallbackKey);
};

export function Login() {
  const { t } = useTranslation();
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(getAuth(), email.trim(), password);
    } catch (e) {
      setError(friendlyAuthError(e, "auth.loginFailed"));
    }
  };

  const handleRegister = async () => {
    setError("");
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      if (trimmedFirst || trimmedLast) {
        await updateProfile(user, { displayName: [trimmedFirst, trimmedLast].filter(Boolean).join("|") });
      }
      await sendEmailVerification(user);
    } catch (e) {
      setError(friendlyAuthError(e, "auth.registrationFailed"));
    }
  };

  return (
    <main className="auth-page" style={authTheme}>
      <div className="auth-container">
        <h1 className="auth-title">{t("auth.welcome")}</h1>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <EmailForm
          mode={emailMode}
          onSubmit={emailMode === "login" ? handleLogin : handleRegister}
          onToggleMode={() => setEmailMode(emailMode === "login" ? "register" : "login")}
          {...{ email, setEmail, password, setPassword, firstName, setFirstName, lastName, setLastName }}
        />
      </div>
    </main>
  );
}
