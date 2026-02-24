import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = {
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpacked", label: "Unpacked" },
  { value: "packed", label: "Packed" },
];

const getIndex = (status: StatusFilter) =>
  STATUS_OPTIONS.findIndex((o) => o.value === status);

export const StatusSection = ({
  statusFilter,
  onSetStatus,
}: StatusSectionProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const optionWidth = containerWidth / STATUS_OPTIONS.length;

  useEffect(() => {
    if (optionWidth === 0) return;
    Animated.spring(slideAnim, {
      toValue: optionWidth * getIndex(statusFilter),
      useNativeDriver: true,
      speed: 20,
    }).start();
  }, [statusFilter, optionWidth, slideAnim]);

  const handlePress = (status: StatusFilter) => {
    onSetStatus(status);
  };

  const isActive = statusFilter !== "all";
  const getTextStyle = (value: StatusFilter) =>
    value === statusFilter
      ? [styles.toggleText, styles.toggleTextSelected]
      : styles.toggleText;

  return (
    <>
      <Text style={styles.sectionTitle}>Status</Text>
      <View
        style={[
          styles.toggleContainer,
          isActive && styles.toggleContainerActive,
        ]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 6)}
      >
        <Animated.View
          style={[
            styles.toggleSelector,
            { width: optionWidth, transform: [{ translateX: slideAnim }] },
          ]}
        />
        {STATUS_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.toggleOption}
            onPress={() => handlePress(opt.value)}
          >
            <Text style={getTextStyle(opt.value)}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};
