import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";

type FloatingAddButtonProps = {
  onPress: () => void;
};

export const FloatingAddButton = ({ onPress }: FloatingAddButtonProps) => (
  <Pressable style={styles.fab} onPress={onPress} accessibilityRole="button" accessibilityLabel="Add">
    <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
  </Pressable>
);

const FAB_SIZE = 56;
const SEARCH_BUTTON_BOTTOM = 30;
const SEARCH_FAB_SIZE = 48;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: SEARCH_BUTTON_BOTTOM + SEARCH_FAB_SIZE + homeSpacing.sm,
    right: homeSpacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
