import { useState } from "react";
import { Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { SpacePicker } from "./SpacePicker.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

type HeaderProps = {
  title: string;
  email: string;
  profileImageUrl?: string;
  onBack?: () => void;
  onPressTitle?: () => void;
  onProfile?: () => void;
  onManageSpace?: () => void;
  useSpaceAsTitle?: boolean;
};

const BackButton = ({ onBack }: { onBack?: () => void }) =>
  onBack ? (
    <Pressable style={homeStyles.backButton} onPress={onBack} accessibilityRole="button" hitSlop={8}>
      <Text style={homeStyles.backText}>{HOME_COPY.back}</Text>
    </Pressable>
  ) : (
    <View style={homeStyles.backPlaceholder} />
  );

const AvatarButton = ({ email, imageUrl, onProfile }: { email: string; imageUrl?: string; onProfile?: () => void }) => (
  <Pressable style={homeStyles.avatar} onPress={onProfile} accessibilityRole="button" hitSlop={8}>
    {imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={homeStyles.avatarImage} />
    ) : (
      <Text style={homeStyles.avatarLabel}>{buildInitial(email)}</Text>
    )}
  </Pressable>
);

const buildInitial = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed) return HOME_COPY.avatarFallback;
  return trimmed[0]?.toUpperCase() ?? HOME_COPY.avatarFallback;
};

const Title = ({ title, onPress }: { title: string; onPress?: () => void }) =>
  onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={homeStyles.panelTitleWrapper}>
      <Text style={homeStyles.panelTitle} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  ) : (
    <Text style={homeStyles.panelTitle} numberOfLines={1}>
      {title}
    </Text>
  );

export const HomeHeader = ({
  title,
  email,
  profileImageUrl,
  onBack,
  onPressTitle,
  onProfile,
  onManageSpace,
  useSpaceAsTitle,
}: HeaderProps) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  return (
    <View style={headerLocalStyles.wrapper}>
      {!useSpaceAsTitle && <SpaceBar onPress={() => setPickerVisible(true)} />}
      <View style={homeStyles.panelHeader}>
        <BackButton onBack={onBack} />
        {useSpaceAsTitle ? (
          <SpaceTitle onPress={() => setPickerVisible(true)} />
        ) : (
          <Title title={title} onPress={onPressTitle} />
        )}
        <AvatarButton email={email} imageUrl={profileImageUrl} onProfile={onProfile} />
      </View>
      <SpacePicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onManageSpace={onManageSpace} />
    </View>
  );
};

const SpaceTitle = ({ onPress }: { onPress: () => void }) => {
  const { activeSpace } = useSpace();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={homeStyles.panelTitleWrapper}>
      <View style={headerLocalStyles.spaceTitleRow}>
        <Text style={homeStyles.panelTitle} numberOfLines={1}>
          {activeSpace?.name ?? ""}
        </Text>
        <Text style={headerLocalStyles.spaceTitleChevron}>{spaceCopy.chevron}</Text>
      </View>
    </Pressable>
  );
};

const SpaceBar = ({ onPress }: { onPress: () => void }) => {
  const { activeSpace, spaces } = useSpace();
  const { pendingInvites } = useInvites();
  const hasMultiple = spaces.length > 1 || pendingInvites.length > 0;
  return (
    <Pressable style={headerLocalStyles.spaceBar} onPress={onPress} accessibilityRole="button">
      <Text style={headerLocalStyles.spaceName} numberOfLines={1}>
        {activeSpace?.name ?? ""}
        {hasMultiple ? spaceCopy.chevron : ""}
      </Text>
      {pendingInvites.length > 0 && (
        <View style={headerLocalStyles.inviteBadge}>
          <Text style={headerLocalStyles.inviteBadgeText}>{pendingInvites.length}</Text>
        </View>
      )}
    </Pressable>
  );
};

const headerLocalStyles = StyleSheet.create({
  wrapper: { gap: 2 },
  spaceTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  spaceTitleChevron: { fontSize: 20, fontWeight: "700", color: homeColors.text, marginLeft: 4 },
  spaceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: homeSpacing.xs,
    paddingBottom: 2,
  },
  spaceName: { fontSize: 12, fontWeight: "500", color: homeColors.muted, textAlign: "center" },
  inviteBadge: {
    backgroundColor: homeColors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  inviteBadgeText: { fontSize: 10, fontWeight: "700", color: homeColors.buttonText },
});
