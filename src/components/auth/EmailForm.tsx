import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { EmailFields, type EmailFieldsProps } from "./EmailFields.tsx";
import { PasswordResetButton } from "./PasswordResetButton.tsx";

type EmailFormProps = EmailFieldsProps & {
  mode: "login" | "register";
  onSubmit: () => Promise<void>;
  onToggleMode: () => void;
};

export function EmailForm(props: EmailFormProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const { mode, email, onSubmit, onToggleMode } = props;

  const isRegister = mode === "register";
  const submit = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onSubmit();
    } finally {
      setPending(false);
    }
  };
  const submitFromInput = () => void submit();
  const submitLabel = isRegister
    ? pending
      ? "auth.creatingAccount"
      : "auth.createAccount"
    : pending
      ? "auth.signingIn"
      : "auth.login";

  return (
    <View style={styles.section}>
      <EmailFields {...props} isRegister={isRegister} pending={pending} onSubmitEditing={submitFromInput} />
      <Button label={t(submitLabel)} onPress={submitFromInput} disabled={pending} />
      {!isRegister && Platform.OS === "web" ? <PasswordResetButton email={email} disabled={pending} /> : null}
      <Button
        disabled={pending}
        label={t(isRegister ? "auth.backToLogin" : "auth.createAccountInstead")}
        onPress={onToggleMode}
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: homeSpacing.sm },
});
