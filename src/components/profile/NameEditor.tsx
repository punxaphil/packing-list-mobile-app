import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { updateProfileName } from "~/services/spaceDatabase.ts";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { profileCopy } from "./profileCopy.ts";

export const NameEditor = () => {
  const { profile } = useSpace();
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const currentFirstName = profile?.firstName ?? "";
  const currentLastName = profile?.lastName ?? "";
  const hasChanges = firstName !== currentFirstName || lastName !== currentLastName;

  useEffect(() => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
  }, [currentFirstName, currentLastName]);

  const restore = () => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
  };

  const save = async () => {
    if (!profile?.id) return;
    await updateProfileName(profile.id, firstName.trim(), lastName.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{profileCopy.firstName}</Text>
      <TextInput
        autoCapitalize="words"
        placeholder={profileCopy.firstName}
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={styles.inputLabel}>{profileCopy.lastName}</Text>
      <TextInput
        autoCapitalize="words"
        placeholder={profileCopy.lastName}
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <View style={styles.actions}>
        <Button label={commonCopy.cancel} onPress={restore} disabled={!hasChanges} flex />
        <Button
          variant="primary"
          label={profileCopy.updateName}
          onPress={() => void save()}
          disabled={!hasChanges}
          flex
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
  actions: {
    flexDirection: "row",
    gap: homeSpacing.sm,
  },
  inputLabel: { fontSize: 12, fontWeight: "600", color: homeColors.muted },
  input: {
    borderColor: homeColors.border,
    borderWidth: 1,
    borderRadius: homeRadius,
    paddingVertical: 12,
    paddingHorizontal: homeSpacing.md,
  },
});
