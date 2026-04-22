import { StyleSheet, TextInput, View } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";

type EmailFormProps = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  onLogin: () => void;
  onRegister: () => void;
};

export function EmailForm(props: EmailFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    onLogin,
    onRegister,
  } = props;
  return (
    <View style={styles.section}>
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
      <Button label="Login" onPress={onLogin} />
      <Button label="Register" onPress={onRegister} />
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
