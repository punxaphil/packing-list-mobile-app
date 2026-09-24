import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { PasswordResetButton } from "./PasswordResetButton.tsx";

type EmailFormProps = {
  mode: "login" | "register";
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
};

export function EmailForm(props: EmailFormProps) {
  const { t } = useTranslation();
  const {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    onSubmit,
    onToggleMode,
  } = props;

  const isRegister = mode === "register";

  return (
    <View style={styles.section}>
      {isRegister && (
        <>
          <TextInput
            autoCapitalize="words"
            placeholder={t("auth.firstNameOptional")}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            autoCapitalize="words"
            placeholder={t("auth.lastNameOptional")}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      )}
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder={t("auth.email")}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        autoCapitalize="none"
        secureTextEntry
        placeholder={t("auth.password")}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button label={t(isRegister ? "auth.createAccount" : "auth.login")} onPress={onSubmit} />
      {!isRegister && Platform.OS === "web" ? <PasswordResetButton email={email} /> : null}
      <Button
        label={t(isRegister ? "auth.backToLogin" : "auth.createAccountInstead")}
        onPress={onToggleMode}
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: homeSpacing.sm },
  input: {
    width: "100%",
    borderColor: homeColors.border,
    borderWidth: 1,
    borderRadius: homeRadius,
    paddingVertical: 12,
    paddingHorizontal: homeSpacing.md,
  },
});
