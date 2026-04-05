import { useState } from "react";
import { Platform, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { ProfileScreen } from "~/components/profile/ProfileScreen.tsx";
import { PageSheet } from "~/components/shared/PageSheet.tsx";
import { SpaceManagementScreen } from "~/components/space/SpaceManagementScreen.tsx";
import { useApp } from "~/providers/AppProvider.tsx";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { SpacePicker } from "./SpacePicker.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

const AVATAR_SIZE = homeSpacing.lg * 2;

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

const BackButton = ({ onBack }: { onBack?: () => void }) => (
  <View style={headerLocalStyles.sideSlot}>
    {onBack ? (
      <Pressable style={headerLocalStyles.backButton} onPress={onBack} accessibilityRole="button" hitSlop={8}>
        <Text style={homeStyles.backText}>{HOME_COPY.back}</Text>
      </Pressable>
    ) : null}
  </View>
);

const AvatarButton = ({ email, imageUrl, onProfile }: { email: string; imageUrl?: string; onProfile?: () => void }) => (
  <View style={headerLocalStyles.avatarSlot}>
    <Pressable style={headerLocalStyles.avatarButton} onPress={onProfile} accessibilityRole="button" hitSlop={8}>
      {imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={headerLocalStyles.avatarImage} />
      ) : (
        <Text style={headerLocalStyles.avatarLabel}>{buildInitial(email)}</Text>
      )}
    </Pressable>
  </View>
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
  const [profileVisible, setProfileVisible] = useState(false);
  const [spaceManagementVisible, setSpaceManagementVisible] = useState(false);
  const { signOut } = useApp();

  const openProfile = () => {
    if (Platform.OS === "ios") {
      setProfileVisible(true);
      return;
    }
    onProfile?.();
  };

  const openManageSpace = () => {
    if (Platform.OS === "ios") {
      setSpaceManagementVisible(true);
      return;
    }
    onManageSpace?.();
  };

  return (
    <View style={headerLocalStyles.wrapper}>
      <View style={headerLocalStyles.header}>
        <BackButton onBack={onBack} />
        <View style={headerLocalStyles.titleStack}>
          {useSpaceAsTitle ? (
            <SpaceTitle onPress={() => setPickerVisible(true)} />
          ) : (
            <StackedTitle title={title} onPress={onPressTitle} />
          )}
        </View>
        <AvatarButton email={email} imageUrl={profileImageUrl} onProfile={openProfile} />
      </View>
      <SpacePicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onManageSpace={openManageSpace} />
      <PageSheet visible={profileVisible} title="Profile" onClose={() => setProfileVisible(false)} scrollable={false}>
        <ProfileScreen email={email} onSignOut={signOut} embeddedInSheet />
      </PageSheet>
      <PageSheet
        visible={spaceManagementVisible}
        title="Manage Space"
        onClose={() => setSpaceManagementVisible(false)}
        scrollable={false}
      >
        <SpaceManagementScreen embeddedInSheet onBack={() => setSpaceManagementVisible(false)} />
      </PageSheet>
    </View>
  );
};

const StackedTitle = ({ title, onPress }: { title: string; onPress?: () => void }) => (
  <>
    <SpaceBar />
    <Title title={title} onPress={onPress} />
  </>
);

const SpaceTitle = ({ onPress }: { onPress: () => void }) => {
  const { activeSpace } = useSpace();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={headerLocalStyles.spaceTitlePressable}>
      <View style={headerLocalStyles.spaceTitleRow}>
        <Text style={homeStyles.panelTitle} numberOfLines={1}>
          {activeSpace?.name ?? ""}
        </Text>
        <Text style={headerLocalStyles.spaceTitleChevron}>{spaceCopy.chevron}</Text>
      </View>
    </Pressable>
  );
};

const SpaceBar = () => {
  const { activeSpace } = useSpace();
  const { pendingInvites } = useInvites();
  return (
    <View style={headerLocalStyles.spaceBar}>
      <Text style={headerLocalStyles.spaceName} numberOfLines={1}>
        {activeSpace?.name ?? ""}
      </Text>
      {pendingInvites.length > 0 && (
        <View style={headerLocalStyles.inviteBadge}>
          <Text style={headerLocalStyles.inviteBadgeText}>{pendingInvites.length}</Text>
        </View>
      )}
    </View>
  );
};

const headerLocalStyles = StyleSheet.create({
  wrapper: { paddingTop: homeSpacing.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: homeSpacing.sm,
  },
  titleStack: {
    flex: 1,
    minHeight: AVATAR_SIZE,
    justifyContent: "center",
    gap: 2,
  },
  sideSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: homeSpacing.xs,
    paddingHorizontal: homeSpacing.sm,
    justifyContent: "center",
  },
  avatarSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: homeSpacing.lg,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarLabel: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: homeSpacing.lg,
  },
  spaceTitlePressable: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
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
