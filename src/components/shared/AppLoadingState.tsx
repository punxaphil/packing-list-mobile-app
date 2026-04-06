import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { homeColors, homeSpacing } from "~/components/home/theme.ts";

type AppLoadingStateProps = {
  label?: string;
};

export function AppLoadingState({ label }: AppLoadingStateProps) {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.host}>
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={homeColors.primary} />
        <Text style={[styles.label, !label ? styles.labelHidden : null]}>{label ?? "Loading..."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    minHeight: 24,
    marginTop: homeSpacing.sm,
    fontSize: 16,
    fontWeight: "500",
    color: homeColors.muted,
  },
  labelHidden: {
    opacity: 0,
  },
});
