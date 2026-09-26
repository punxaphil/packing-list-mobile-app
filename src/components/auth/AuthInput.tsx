type AuthInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  type?: "text" | "email" | "password";
  autoComplete: string;
  autoCapitalize?: "words" | "none";
};

export const AuthInput = ({
  label,
  value,
  onChange,
  onSubmit,
  disabled,
  type = "text",
  autoComplete,
  autoCapitalize,
}: AuthInputProps) => (
  <label className="auth-field">
    <span>{label}</span>
    <input
      className="auth-input"
      type={type}
      value={value}
      disabled={disabled}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit();
        }
      }}
    />
  </label>
);
