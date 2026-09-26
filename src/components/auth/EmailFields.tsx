import { useTranslation } from "react-i18next";
import { AuthInput } from "./AuthInput.tsx";

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
  return (
    <>
      {isRegister && (
        <>
          <AuthInput
            label={t("auth.firstNameOptional")}
            value={fields.firstName}
            onChange={fields.setFirstName}
            disabled={pending}
            onSubmit={onSubmitEditing}
            autoComplete="given-name"
            autoCapitalize="words"
          />
          <AuthInput
            label={t("auth.lastNameOptional")}
            value={fields.lastName}
            onChange={fields.setLastName}
            disabled={pending}
            onSubmit={onSubmitEditing}
            autoComplete="family-name"
            autoCapitalize="words"
          />
        </>
      )}
      <AuthInput
        label={t("auth.email")}
        value={fields.email}
        onChange={fields.setEmail}
        disabled={pending}
        onSubmit={onSubmitEditing}
        autoComplete="email"
        type="email"
        autoCapitalize="none"
      />
      <AuthInput
        label={t("auth.password")}
        value={fields.password}
        onChange={fields.setPassword}
        disabled={pending}
        onSubmit={onSubmitEditing}
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
      />
    </>
  );
}
