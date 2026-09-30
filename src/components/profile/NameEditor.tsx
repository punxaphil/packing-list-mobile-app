import { type CSSProperties, useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { updateProfileName } from "~/services/spaceDatabase.ts";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { FormField } from "../shared/FormField.tsx";
import { profileCopy } from "./profileCopy.ts";
import "./nameEditor.css";

const theme = {
  "--name-text": homeColors.text,
  "--name-border": homeColors.border,
  "--name-focus": homeColors.primaryStrong,
  "--name-sm": `${homeSpacing.sm}px`,
  "--name-md": `${homeSpacing.md}px`,
  "--name-lg": `${homeSpacing.lg}px`,
  "--name-radius": `${homeRadius}px`,
} as CSSProperties;

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
    <div className="profile-name-editor" style={theme}>
      <FormField label={profileCopy.firstName}>
        <input
          autoCapitalize="words"
          className="profile-name-input"
          value={firstName}
          onChange={(event) => setFirstName(event.currentTarget.value)}
        />
      </FormField>
      <FormField label={profileCopy.lastName}>
        <input
          autoCapitalize="words"
          className="profile-name-input"
          value={lastName}
          onChange={(event) => setLastName(event.currentTarget.value)}
        />
      </FormField>
      <div className="profile-name-actions">
        <Button label={commonCopy.cancel} onPress={restore} disabled={!hasChanges} flex />
        <Button
          variant="primary"
          label={profileCopy.updateName}
          onPress={() => void save()}
          disabled={!hasChanges}
          flex
        />
      </div>
    </div>
  );
};
