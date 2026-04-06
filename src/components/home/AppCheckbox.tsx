import { Pressable, StyleSheet, View } from "react-native";
import { homeColors } from "./theme.ts";

type AppCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: number;
};

export const AppCheckbox = ({
  checked,
  onToggle,
  disabled = false,
  size = 16,
}: AppCheckboxProps) => {
  const radius = Math.max(4, Math.round(size * 0.28));
  const markWidth = Math.max(5, Math.round(size * 0.3));
  const markHeight = Math.max(9, Math.round(size * 0.52));
  const markStroke = Math.max(2, Math.round(size * 0.15));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onToggle}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        checked ? styles.checked : null,
        disabled ? styles.disabled : null,
      ]}
    >
      {checked ? (
        <View
          style={[
            styles.mark,
            {
              width: markWidth,
              height: markHeight,
              borderRightWidth: markStroke,
              borderBottomWidth: markStroke,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: homeColors.border,
    backgroundColor: homeColors.surface,
  },
  checked: {
    borderColor: homeColors.primaryStrong,
    backgroundColor: homeColors.primaryStrong,
  },
  mark: {
    borderColor: homeColors.surface,
    transform: [{ rotate: "45deg" }],
    marginBottom: 1,
  },
  disabled: { opacity: 0.45 },
});
