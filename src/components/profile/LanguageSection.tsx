import i18next from "i18next";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getDeviceLanguage,
  type LanguagePreference,
  loadLanguagePreference,
  resolveLanguage,
  SUPPORTED_LANGUAGES,
  saveLanguagePreference,
} from "~/services/languagePreference.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { profileCopy } from "./profileCopy.ts";

export const LanguageSection = () => {
  const [pref, setPref] = useState<LanguagePreference>({
    useDeviceLanguage: true,
    language: getDeviceLanguage(),
  });

  useEffect(() => {
    void loadLanguagePreference().then(setPref);
  }, []);

  const apply = async (newPref: LanguagePreference) => {
    setPref(newPref);
    await saveLanguagePreference(newPref);
    await i18next.changeLanguage(resolveLanguage(newPref));
  };

  const openLanguagePicker = () => {
    showActionSheet(
      profileCopy.selectLanguage,
      SUPPORTED_LANGUAGES.map((l) => ({
        text: l.label,
        onPress: () => void apply({ ...pref, useDeviceLanguage: false, language: l.code }),
      }))
    );
  };

  const currentLabel = SUPPORTED_LANGUAGES.find((l) => l.code === resolveLanguage(pref))?.label ?? "";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{profileCopy.useDeviceLanguage}</Text>
        <Switch
          value={pref.useDeviceLanguage}
          onValueChange={(v) => void apply({ ...pref, useDeviceLanguage: v })}
          trackColor={{ true: homeColors.primary, false: homeColors.border }}
        />
      </View>
      {!pref.useDeviceLanguage && (
        <Pressable style={styles.row} onPress={openLanguagePicker}>
          <Text style={styles.label}>{profileCopy.language}</Text>
          <Text style={styles.value}>{currentLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={homeColors.muted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: homeSpacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { flex: 1, fontSize: 16, color: homeColors.text, marginRight: homeSpacing.sm },
  value: { fontSize: 16, color: homeColors.muted },
});
