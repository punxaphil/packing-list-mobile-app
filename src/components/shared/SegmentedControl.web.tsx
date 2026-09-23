import { Pressable, Text, View } from "react-native";
import { segmentedControlStyles as styles } from "./segmentedControlStyles.ts";

type SegmentedControlProps = {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export const SegmentedControl = ({ values, selectedIndex, onChange }: SegmentedControlProps) => (
  <View style={styles.container}>
    {values.map((value, index) => (
      <Pressable
        key={value}
        style={[styles.segment, index === selectedIndex && styles.segmentSelected]}
        onPress={() => onChange(index)}
      >
        <Text style={[styles.label, index === selectedIndex && styles.labelSelected]}>{value}</Text>
      </Pressable>
    ))}
  </View>
);
