import { StyleSheet, Switch, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { updateProfileWrapItemText } from "~/services/spaceDatabase.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";

const COPY = {
  title: "Preferences",
  wrapItemText: "Show full item text",
};

export const PreferencesSection = () => {
  const { profile } = useSpace();
  const wrapItemText = profile?.wrapItemText ?? false;

  const toggle = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileWrapItemText(profile.id, value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{COPY.title}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{COPY.wrapItemText}</Text>
        <Switch
          value={wrapItemText}
          onValueChange={toggle}
          trackColor={{ true: homeColors.primary, false: homeColors.border }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: homeSpacing.lg,
    gap: homeSpacing.sm,
  },
  title: { fontSize: 16, fontWeight: "600", color: homeColors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, color: homeColors.text },
});
