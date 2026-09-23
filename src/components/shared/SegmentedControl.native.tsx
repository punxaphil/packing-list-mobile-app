import NativeSegmentedControl from "@react-native-segmented-control/segmented-control";

type SegmentedControlProps = {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export const SegmentedControl = ({ values, selectedIndex, onChange }: SegmentedControlProps) => (
  <NativeSegmentedControl
    values={values}
    selectedIndex={selectedIndex}
    onChange={(event) => onChange(event.nativeEvent.selectedSegmentIndex)}
  />
);
