import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ICON_COLORS, buttonStyles as styles } from "./buttonStyles.ts";
import { homeColors } from "../home/theme.ts";

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
const PRESS_IN_DURATION = 140;
const PRESS_OUT_DURATION = 220;
const BACKGROUND_COLORS = {
  apple: ["#000000", "#1f2937"],
  ghost: ["transparent", homeColors.highlightSubtle],
  primary: [homeColors.primaryStrong, "#7dbcfb"],
  danger: [homeColors.surface, "#fef2f2"],
  default: [homeColors.surface, homeColors.primaryLight],
} as const;

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

export const Button = ({
  label,
  onPress,
  variant = "default",
  icon,
  centered,
  disabled,
  flex,
}: ButtonProps) => {
  const press = useRef(new Animated.Value(0)).current;

  const animate = (toValue: number) => {
    Animated.timing(press, {
      toValue,
      duration: toValue === 1 ? PRESS_IN_DURATION : PRESS_OUT_DURATION,
      useNativeDriver: false,
    }).start();
  };

  const scale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });
  const [idleColor, pressedColor] = BACKGROUND_COLORS[variant];
  const backgroundColor = press.interpolate({
    inputRange: [0, 1],
    outputRange: [idleColor, pressedColor],
  });

  const displayLabel = variant === "apple" ? `${APPLE_SYMBOL} ${label}` : label;
  const textEl = (
    <Text
      style={[
        styles.text,
        TEXT_STYLES[variant],
        disabled && styles.disabledText,
      ]}
    >
      {displayLabel}
    </Text>
  );

  return (
    <Pressable
      style={[centered && styles.centered, flex && styles.flex]}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(1)}
      onPressOut={() => animate(0)}
    >
      <Animated.View
        style={[
          styles.base,
          VARIANT_STYLES[variant],
          disabled && styles.disabled,
          {
            backgroundColor: disabled
              ? BACKGROUND_COLORS[variant][0]
              : backgroundColor,
            transform: [{ scale }],
          },
        ]}
      >
        {icon ? (
          <View style={styles.row}>
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={ICON_COLORS[variant]}
            />
            {textEl}
          </View>
        ) : (
          textEl
        )}
      </Animated.View>
    </Pressable>
  );
};
