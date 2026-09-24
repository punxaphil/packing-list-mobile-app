import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput } from "react-native";
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
          <TextInput
            {...webDisabled}
            autoCapitalize="words"
            editable={!pending}
            onSubmitEditing={onSubmitEditing}
            placeholder={t("auth.firstNameOptional")}
            style={styles.input}
            value={fields.firstName}
            onChangeText={fields.setFirstName}
          />
          <TextInput
            {...webDisabled}
            autoCapitalize="words"
            editable={!pending}
            onSubmitEditing={onSubmitEditing}
            placeholder={t("auth.lastNameOptional")}
            style={styles.input}
            value={fields.lastName}
            onChangeText={fields.setLastName}
          />
        </>
      )}
      <TextInput
        {...webDisabled}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!pending}
        keyboardType="email-address"
        onSubmitEditing={onSubmitEditing}
        placeholder={t("auth.email")}
        style={styles.input}
        value={fields.email}
        onChangeText={fields.setEmail}
      />
      <TextInput
        {...webDisabled}
        autoCapitalize="none"
        editable={!pending}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry
        placeholder={t("auth.password")}
        style={styles.input}
        value={fields.password}
        onChangeText={fields.setPassword}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderColor: homeColors.border,
    borderWidth: 1,
    borderRadius: homeRadius,
    paddingVertical: 12,
    paddingHorizontal: homeSpacing.md,
  },
});
