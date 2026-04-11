import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ICON_COLORS, buttonStyles as styles } from "./buttonStyles.ts";

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

const APPLE_SYMBOL = "\uF8FF";

const VARIANT_STYLES = {
  apple: styles.filledApple,
  ghost: styles.ghost,
  primary: styles.filledPrimary,
  danger: styles.outlineDanger,
  default: styles.outlineNeutral,
};

const TEXT_STYLES = {
  apple: styles.textApple,
  ghost: styles.textGhost,
  primary: styles.textPrimary,
  danger: styles.textDanger,
  default: styles.textNeutral,
};

export const Button = ({ label, onPress, variant = "default", icon, centered, disabled, flex }: ButtonProps) => {
  const displayLabel = variant === "apple" ? `${APPLE_SYMBOL} ${label}` : label;
  const textEl = (
    <Text style={[styles.text, TEXT_STYLES[variant], disabled && styles.disabledText]}>{displayLabel}</Text>
  );
  return (
    <Pressable
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        centered && styles.centered,
        flex && styles.flex,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon ? (
        <View style={styles.row}>
          <MaterialCommunityIcons name={icon} size={18} color={ICON_COLORS[variant]} />
          {textEl}
        </View>
      ) : (
        textEl
      )}
    </Pressable>
  );
};
