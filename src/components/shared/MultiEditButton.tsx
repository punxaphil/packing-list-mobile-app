import "@mdi/font/css/materialdesignicons.css";
import { homeColors, homeSpacing } from "../home/theme.ts";
import "./multiEditButton.css";

type Props = {
  label: string;
  onPress: () => void;
  disabled: boolean;
};

export const MultiEditButton = ({ label, onPress, disabled }: Props) => (
  <button
    className="multi-edit-button"
    type="button"
    style={{ color: homeColors.muted, padding: homeSpacing.xs }}
    onClick={onPress}
    disabled={disabled}
    aria-label={label}
  >
    <span className="mdi mdi-pencil-box-multiple-outline" aria-hidden="true" />
  </button>
);
