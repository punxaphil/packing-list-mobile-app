import { Pressable, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeColors, homeSpacing } from "../home/theme.ts";

type Props = {
  label: string;
  onPress: () => void;
  disabled: boolean;
};

export const MultiEditButton = ({ label, onPress, disabled }: Props) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    disabled={disabled}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <MaterialCommunityIcons name="pencil-box-multiple-outline" size={20} color={homeColors.muted} />
  </Pressable>
);

const styles = StyleSheet.create({ button: { padding: homeSpacing.xs } });
