import { Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { profileCopy } from "../profile/profileCopy.ts";
import { Button } from "../shared/Button.tsx";
import { DisabledQuickAddRow } from "./DisabledQuickAddRow.tsx";
import { HomeHeader } from "./HomeHeader.tsx";
import { homeStyles } from "./styles.ts";
import { homeSpacing } from "./theme.ts";

type Props = {
  email: string;
  onProfile: () => void;
  onShowLists: () => void;
};

export const NoSelectionPanel = ({ email, onProfile, onShowLists }: Props) => {
  const { profile } = useSpace();
  return (
    <View style={homeStyles.swipeWrapper}>
      <View style={homeStyles.panel}>
        <HomeHeader
          title={profileCopy.noListSelected}
          email={email}
          profileImageUrl={profile?.imageUrl}
          onProfile={onProfile}
        />
        <View style={homeStyles.panelBody}>
          <DisabledQuickAddRow />
          <View style={emptyStyle}>
            <Text style={homeStyles.emptyText}>{profileCopy.noListMessage}</Text>
            <Button label={profileCopy.showLists} onPress={onShowLists} />
          </View>
        </View>
      </View>
    </View>
  );
};

const emptyStyle = {
  alignItems: "center" as const,
  paddingVertical: homeSpacing.md,
  gap: homeSpacing.sm,
};
