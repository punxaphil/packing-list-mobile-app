import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = { statusFilter: StatusFilter; onSetStatus: (status: StatusFilter) => void };

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpacked", label: "Unpacked" },
  { value: "packed", label: "Packed" },
];

export const StatusSection = ({ statusFilter, onSetStatus }: StatusSectionProps) => {
  const [localStatus, setLocalStatus] = useState(statusFilter);

  useEffect(() => { setLocalStatus(statusFilter); }, [statusFilter]);

  const handlePress = (status: StatusFilter) => {
    setLocalStatus(status);
    requestAnimationFrame(() => onSetStatus(status));
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.toggleContainer}>
        {STATUS_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.toggleOption, localStatus === opt.value && styles.toggleOptionSelected]} onPress={() => handlePress(opt.value)}>
            <Text style={[styles.toggleText, localStatus === opt.value && styles.toggleTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};
