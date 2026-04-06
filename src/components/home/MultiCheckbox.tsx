import { View } from "react-native";
import { areAllMembersChecked } from "~/services/packItemState.ts";
import { PackItem } from "~/types/PackItem.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { homeStyles } from "./styles.ts";

type MultiCheckboxProps = {
  item: PackItem;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  checkedColor?: string;
};

export const MultiCheckbox = ({ item, disabled, onToggle, checkedColor }: MultiCheckboxProps) => {
  const allChecked = areAllMembersChecked(item.members);
  const allUnchecked = item.members.every((m) => !m.checked);
  const indeterminate = !allChecked && !allUnchecked;
  return (
    <View style={homeStyles.categoryCheckboxWrapper}>
      <AppCheckbox
        checked={allChecked}
        onToggle={() => onToggle(!allChecked)}
        disabled={disabled}
        size={16}
        checkedColor={checkedColor}
      />
      {indeterminate && <View pointerEvents="none" style={homeStyles.itemCheckboxIndicator} />}
    </View>
  );
};
