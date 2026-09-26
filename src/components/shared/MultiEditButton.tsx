import { type CSSProperties } from "react";
import glyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
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
    style={{ color: homeColors.muted, padding: homeSpacing.xs } as CSSProperties}
    onClick={onPress}
    disabled={disabled}
    aria-label={label}
  >
    {String.fromCodePoint(glyphs["pencil-box-multiple-outline"])}
  </button>
);
