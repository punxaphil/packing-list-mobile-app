import { StyleSheet, View } from "react-native";
import { areAllMembersChecked } from "~/services/packItemState.ts";
import { PackItem } from "~/types/PackItem.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { homeColors } from "./theme.ts";

const INDICATOR_WIDTH_RATIO = 0.6;
const INDICATOR_LEFT_RATIO = 0.2;
const INDICATOR_TOP_OFFSET = 1;

type MultiCheckboxProps = {
  item: PackItem;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  checkedColor?: string;
  size?: number;
};

export const MultiCheckbox = ({ item, disabled, onToggle, checkedColor, size = 16 }: MultiCheckboxProps) => {
  const allChecked = areAllMembersChecked(item.members);
  const allUnchecked = item.members.every((m) => !m.checked);
  const indeterminate = !allChecked && !allUnchecked;
  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <AppCheckbox
        checked={allChecked}
        onToggle={() => onToggle(!allChecked)}
        disabled={disabled}
        size={size}
        checkedColor={checkedColor}
      />
      {indeterminate && (
        <View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: size * INDICATOR_WIDTH_RATIO,
              top: size / 2 - INDICATOR_TOP_OFFSET,
              left: size * INDICATOR_LEFT_RATIO,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    height: 2,
    backgroundColor: homeColors.text,
    borderRadius: 2,
  },
});
