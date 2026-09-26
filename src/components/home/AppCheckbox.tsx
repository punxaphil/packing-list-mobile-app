import type { CSSProperties } from "react";
import { homeColors } from "./theme.ts";
import "./appCheckbox.css";

type AppCheckboxProps = {
  checked: boolean;
  label: string;
  id?: string;
  onToggle: () => void;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: number;
  checkedColor?: string;
};

export const AppCheckbox = ({
  checked,
  label,
  id,
  onToggle,
  disabled = false,
  indeterminate = false,
  size = 16,
  checkedColor = homeColors.primaryStrong,
}: AppCheckboxProps) => {
  const radius = Math.max(4, Math.round(size * 0.28));
  const markWidth = Math.max(5, Math.round(size * 0.3));
  const markHeight = Math.max(9, Math.round(size * 0.52));
  const markStroke = Math.max(2, Math.round(size * 0.15));

  const theme = {
    width: size,
    height: size,
    borderRadius: radius,
    "--checkbox-color": checkedColor,
    "--checkbox-border": homeColors.border,
    "--checkbox-surface": homeColors.surface,
    "--checkbox-text": homeColors.text,
    "--mark-width": `${markWidth}px`,
    "--mark-height": `${markHeight}px`,
    "--mark-stroke": `${markStroke}px`,
  } as CSSProperties;

  return (
    <input
      id={id}
      ref={(input) => {
        if (input) input.indeterminate = indeterminate;
      }}
      className="app-checkbox"
      type="checkbox"
      checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={onToggle}
      style={theme}
    />
  );
};
