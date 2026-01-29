import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = { statusFilter: StatusFilter; onSetStatus: (status: StatusFilter) => void };

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpacked", label: "Unpacked" },
  { value: "packed", label: "Packed" },
];

const getIndex = (status: StatusFilter) => STATUS_OPTIONS.findIndex((o) => o.value === status);

export const StatusSection = ({ statusFilter, onSetStatus }: StatusSectionProps) => {
  const [visualStatus, setVisualStatus] = useState(statusFilter);
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(getIndex(statusFilter))).current;

  useEffect(() => {
    setVisualStatus(statusFilter);
    Animated.spring(slideAnim, { toValue: getIndex(statusFilter), useNativeDriver: true, speed: 20 }).start();
  }, [statusFilter, slideAnim]);

  const handlePress = (status: StatusFilter) => {
    Animated.spring(slideAnim, { toValue: getIndex(status), useNativeDriver: true, speed: 20 }).start(() => {
      setVisualStatus(status);
    });
    requestAnimationFrame(() => onSetStatus(status));
  };

  const isActive = visualStatus !== "all";
  const getTextStyle = (value: StatusFilter) => {
    if (value === visualStatus) return [styles.toggleText, styles.toggleTextSelected];
    if (isActive) return [styles.toggleText, styles.toggleTextInactive];
    return styles.toggleText;
  };

  const optionWidth = containerWidth / STATUS_OPTIONS.length;
  const translateX = slideAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, optionWidth, optionWidth * 2] });

  return (
    <>
      <Text style={styles.sectionTitle}>Status</Text>
      <View
        style={[styles.toggleContainer, isActive && styles.toggleContainerActive]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 6)}
      >
        <Animated.View style={[styles.toggleSelector, { width: optionWidth, transform: [{ translateX }] }]} />
        {STATUS_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={styles.toggleOption} onPress={() => handlePress(opt.value)}>
            <Text style={getTextStyle(opt.value)}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};
