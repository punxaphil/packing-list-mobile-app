import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Platform, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ProfileScreen } from "~/components/profile/ProfileScreen.tsx";
import { PageSheet } from "~/components/shared/PageSheet.tsx";
import { useApp } from "~/providers/AppProvider.tsx";
import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { SpaceSheet } from "./SpaceSheet.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

const AVATAR_SIZE = homeSpacing.lg * 2;

type HeaderProps = {
  title: string;
  email: string;
  profileImageUrl?: string;
  leftImageUrl?: string;
  leftImageLoading?: boolean;
  hideLeftImagePlaceholder?: boolean;
  onBack?: () => void;
  onPressLeftImage?: () => void;
  onPressTitle?: () => void;
  onProfile?: () => void;
  useSpaceAsTitle?: boolean;
};

const BackButton = ({
  onBack,
  leftImageUrl,
  leftImageLoading,
  hideLeftImagePlaceholder,
  onPressLeftImage,
}: {
  onBack?: () => void;
  leftImageUrl?: string;
  leftImageLoading?: boolean;
  hideLeftImagePlaceholder?: boolean;
  onPressLeftImage?: () => void;
}) => (
  <View style={headerLocalStyles.sideSlot}>
    {onBack ? (
      <Pressable style={headerLocalStyles.backButton} onPress={onBack} accessibilityRole="button" hitSlop={8}>
        <Text style={homeStyles.backText}>{HOME_COPY.back}</Text>
      </Pressable>
    ) : onPressLeftImage && (leftImageUrl || !hideLeftImagePlaceholder) ? (
      <Pressable
        style={[headerLocalStyles.leftImageButton, !leftImageUrl && headerLocalStyles.leftImagePlaceholder]}
        onPress={onPressLeftImage}
        disabled={leftImageLoading}
        accessibilityRole="button"
        accessibilityLabel="List image"
      >
        {leftImageLoading ? (
          <ActivityIndicator size="small" color={homeColors.muted} />
        ) : getEmojiValue(leftImageUrl) ? (
          <Text style={headerLocalStyles.avatarEmoji}>{getEmojiValue(leftImageUrl)}</Text>
        ) : leftImageUrl ? (
          <RNImage source={{ uri: leftImageUrl }} style={headerLocalStyles.avatarImage} />
        ) : (
          <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={homeColors.muted} />
        )}
      </Pressable>
    ) : null}
  </View>
);

const AvatarButton = ({
  email,
  imageUrl,
  onProfile,
  showBadge,
}: {
  email: string;
  imageUrl?: string;
  onProfile?: () => void;
  showBadge?: boolean;
}) => (
  <View style={headerLocalStyles.avatarSlot}>
    <Pressable style={headerLocalStyles.avatarButton} onPress={onProfile} accessibilityRole="button" hitSlop={8}>
      {getEmojiValue(imageUrl) ? (
        <Text style={headerLocalStyles.avatarEmoji}>{getEmojiValue(imageUrl)}</Text>
      ) : imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={headerLocalStyles.avatarImage} />
      ) : (
        <Text style={headerLocalStyles.avatarLabel}>{buildInitial(email)}</Text>
      )}
    </Pressable>
    {showBadge && <View style={headerLocalStyles.avatarBadgeDot} />}
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
  leftImageUrl,
  leftImageLoading,
  hideLeftImagePlaceholder,
  onBack,
  onPressLeftImage,
  onPressTitle,
  onProfile,
  useSpaceAsTitle,
}: HeaderProps) => {
  const [spaceSheetVisible, setSpaceSheetVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const { signOut } = useApp();
  const { isSubscribed } = useSubscription();

  const openProfile = () => {
    if (Platform.OS === "ios") {
      setProfileVisible(true);
      return;
    }
    onProfile?.();
  };

  const { t } = useTranslation();

  return (
    <View style={headerLocalStyles.wrapper}>
      <View style={headerLocalStyles.header}>
        <BackButton
          onBack={onBack}
          leftImageUrl={leftImageUrl}
          leftImageLoading={leftImageLoading}
          hideLeftImagePlaceholder={hideLeftImagePlaceholder}
          onPressLeftImage={onPressLeftImage}
        />
        <View style={headerLocalStyles.titleStack}>
          {useSpaceAsTitle ? (
            <SpaceTitle onPress={() => setSpaceSheetVisible(true)} />
          ) : (
            <StackedTitle title={title} onPress={onPressTitle} />
          )}
        </View>
        <AvatarButton email={email} imageUrl={profileImageUrl} onProfile={openProfile} showBadge={!isSubscribed} />
      </View>
      <SpaceSheet visible={spaceSheetVisible} onClose={() => setSpaceSheetVisible(false)} />
      <PageSheet visible={profileVisible} title={t("profile.title")} onClose={() => setProfileVisible(false)}>
        <ProfileScreen email={email} onSignOut={signOut} embeddedInSheet />
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
  leftImageButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: homeSpacing.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  leftImagePlaceholder: {
    backgroundColor: homeColors.border,
  },
  avatarSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  avatarBadgeDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: homeColors.danger,
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
  avatarLabel: {
    color: homeColors.primaryForeground,
    fontWeight: "700",
    fontSize: 18,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: homeSpacing.lg,
  },
  avatarEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  spaceTitlePressable: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  spaceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spaceTitleChevron: {
    fontSize: 20,
    fontWeight: "700",
    color: homeColors.text,
    marginLeft: 4,
  },
  spaceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: homeSpacing.xs,
    paddingBottom: 2,
  },
  spaceName: {
    fontSize: 12,
    fontWeight: "500",
    color: homeColors.muted,
    textAlign: "center",
  },
  inviteBadge: {
    backgroundColor: homeColors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  inviteBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: homeColors.primaryForeground,
  },
});
