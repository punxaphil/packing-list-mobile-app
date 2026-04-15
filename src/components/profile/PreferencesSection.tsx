import { StyleSheet, Switch, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import {
  updateProfileAddNewItemsOnTop,
  updateProfileHideImagePlaceholder,
  updateProfileWrapItemText,
} from "~/services/spaceDatabase.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { profileCopy } from "./profileCopy.ts";

export const PreferencesSection = () => {
  const { profile } = useSpace();
  const wrapItemText = profile?.wrapItemText ?? false;
  const hideImagePlaceholder = profile?.hideImagePlaceholder ?? false;
  const addNewItemsOnTop = profile?.addNewItemsOnTop ?? false;

  const toggleWrapItemText = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileWrapItemText(profile.id, value);
  };

  const toggleHideImagePlaceholder = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileHideImagePlaceholder(profile.id, value);
  };

  const toggleAddNewItemsOnTop = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileAddNewItemsOnTop(profile.id, value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{profileCopy.preferencesTitle}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{profileCopy.wrapItemText}</Text>
        <Switch
          value={wrapItemText}
          onValueChange={toggleWrapItemText}
          trackColor={{ true: homeColors.primary, false: homeColors.border }}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{profileCopy.hideImagePlaceholder}</Text>
        <Switch
          value={hideImagePlaceholder}
          onValueChange={toggleHideImagePlaceholder}
          trackColor={{ true: homeColors.primary, false: homeColors.border }}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{profileCopy.addNewItemsOnTop}</Text>
        <Switch
          value={addNewItemsOnTop}
          onValueChange={toggleAddNewItemsOnTop}
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
  label: {
    flex: 1,
    fontSize: 16,
    color: homeColors.text,
    marginRight: homeSpacing.sm,
  },
});
