type PreferenceToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export const PreferenceToggle = ({ label, checked, onChange }: PreferenceToggleProps) => (
  <label className="profile-preference-row">
    <span className="profile-preference-label">{label}</span>
    <input
      className="profile-preference-switch"
      type="checkbox"
      role="switch"
      aria-checked={checked}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  </label>
);
