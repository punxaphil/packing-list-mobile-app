import { areAllMembersChecked } from "~/services/packItemState.ts";
import { PackItem } from "~/types/PackItem.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";

type MultiCheckboxProps = {
  item: PackItem;
  id?: string;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  checkedColor?: string;
  size?: number;
};

export const MultiCheckbox = ({ item, id, disabled, onToggle, checkedColor, size = 16 }: MultiCheckboxProps) => {
  const allChecked = areAllMembersChecked(item.members);
  const allUnchecked = item.members.every((m) => !m.checked);
  const indeterminate = !allChecked && !allUnchecked;
  return (
    <AppCheckbox
      checked={allChecked}
      id={id}
      indeterminate={indeterminate}
      label={item.name}
      onToggle={() => onToggle(!allChecked)}
      disabled={disabled}
      size={size}
      checkedColor={checkedColor}
    />
  );
};
