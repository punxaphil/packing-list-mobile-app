import { View } from "react-native";
import Checkbox from "expo-checkbox";
import { PackItem } from "~/types/PackItem.ts";
import { homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";

type MultiCheckboxProps = {
  item: PackItem;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
};

export const MultiCheckbox = ({ item, disabled, onToggle }: MultiCheckboxProps) => {
  const allChecked = item.members.every((m) => m.checked);
  const allUnchecked = item.members.every((m) => !m.checked);
  const indeterminate = !allChecked && !allUnchecked;
  return (
    <View style={homeStyles.categoryCheckboxWrapper}>
      <Checkbox
        value={allChecked}
        onValueChange={() => onToggle(!allChecked)}
        color={allChecked ? homeColors.primary : undefined}
        style={homeStyles.checkbox}
        disabled={disabled}
      />
      {indeterminate && <View pointerEvents="none" style={homeStyles.itemCheckboxIndicator} />}
    </View>
  );
};
