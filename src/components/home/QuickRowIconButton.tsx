import "@mdi/font/css/materialdesignicons.css";
import { homeColors } from "./theme.ts";
import "./searchRow.css";

type Props = {
  name:
    | "undo"
    | "note-text-outline"
    | "magnify"
    | "filter-variant"
    | "chevron-up"
    | "chevron-down"
    | "close-circle"
    | "close";
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
};

export const QuickRowIconButton = ({ name, label, onPress, disabled, active }: Props) => (
  <button
    className="quick-search-button"
    type="button"
    onClick={onPress}
    disabled={disabled}
    aria-label={label}
    title={label}
    style={{ color: active ? homeColors.primaryStrong : homeColors.muted }}
  >
    <span className={`mdi mdi-${name}`} aria-hidden="true" />
  </button>
);
