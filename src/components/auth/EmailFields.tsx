import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

export type EmailFieldsProps = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
};

type Props = EmailFieldsProps & { isRegister: boolean; pending: boolean; onSubmitEditing: () => void };

export function EmailFields({ isRegister, pending, onSubmitEditing, ...fields }: Props) {
  const { t } = useTranslation();
  const webDisabled = { disabled: pending };
  return (
    <>
      {isRegister && (
        <>
          <Text style={styles.label}>{t("auth.firstNameOptional")}</Text>
          <TextInput
            {...webDisabled}
            autoCapitalize="words"
            editable={!pending}
            onSubmitEditing={onSubmitEditing}
            accessibilityLabel={t("auth.firstNameOptional")}
            style={styles.input}
            value={fields.firstName}
            onChangeText={fields.setFirstName}
          />
          <Text style={styles.label}>{t("auth.lastNameOptional")}</Text>
          <TextInput
            {...webDisabled}
            autoCapitalize="words"
            editable={!pending}
            onSubmitEditing={onSubmitEditing}
            accessibilityLabel={t("auth.lastNameOptional")}
            style={styles.input}
            value={fields.lastName}
            onChangeText={fields.setLastName}
          />
        </>
      )}
      <Text style={styles.label}>{t("auth.email")}</Text>
      <TextInput
        {...webDisabled}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!pending}
        keyboardType="email-address"
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={t("auth.email")}
        style={styles.input}
        value={fields.email}
        onChangeText={fields.setEmail}
      />
      <Text style={styles.label}>{t("auth.password")}</Text>
      <TextInput
        {...webDisabled}
        autoCapitalize="none"
        editable={!pending}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry
        accessibilityLabel={t("auth.password")}
        style={styles.input}
        value={fields.password}
        onChangeText={fields.setPassword}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, color: homeColors.text },
  input: {
    width: "100%",
    borderColor: homeColors.border,
    borderWidth: 1,
    borderRadius: homeRadius,
    paddingVertical: 12,
    paddingHorizontal: homeSpacing.md,
  },
});
