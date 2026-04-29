import { StyleSheet, TextInput, View } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";

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
            placeholder="First name (optional)"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            autoCapitalize="words"
            placeholder="Last name (optional)"
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
      <Button label={isRegister ? "Create account" : "Login"} onPress={onSubmit} />
      <Button label={isRegister ? "Back to login" : "Create account instead"} onPress={onToggleMode} variant="ghost" />
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
