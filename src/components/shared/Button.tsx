import type { CSSProperties } from "react";
import glyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import { homeColors } from "../home/theme.ts";
import "./button.css";

type Variant = "default" | "danger" | "primary" | "apple" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  centered?: boolean;
  disabled?: boolean;
  flex?: boolean;
};

const theme = {
  "--button-surface": homeColors.surface,
  "--button-border": homeColors.border,
  "--button-primary": homeColors.primaryStrong,
  "--button-primary-foreground": homeColors.primaryForeground,
  "--button-primary-light": homeColors.primaryLight,
  "--button-text": homeColors.text,
  "--button-muted": homeColors.muted,
  "--button-white": homeColors.buttonText,
  "--button-danger": homeColors.danger,
  "--button-black": homeColors.dropIndicator,
  "--button-ghost-hover": homeColors.highlightSubtle,
} as CSSProperties;

export const Button = ({ label, onPress, variant = "default", icon, centered, disabled, flex }: ButtonProps) => {
  const iconName = variant === "apple" ? "apple" : icon;
  const codePoint = iconName ? glyphs[iconName as keyof typeof glyphs] : undefined;

  return (
    <button
      type="button"
      className={`web-button web-button-${variant}${centered ? " web-button-centered" : ""}${flex ? " web-button-flex" : ""}`}
      style={theme}
      onClick={onPress}
      disabled={disabled}
    >
      {codePoint && (
        <span className="web-button-icon" aria-hidden="true">
          {String.fromCodePoint(codePoint)}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
};
