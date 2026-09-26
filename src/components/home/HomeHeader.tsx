import { type CSSProperties, useState } from "react";
import { AvatarButton, BackButton } from "./HeaderSides.tsx";
import { SpaceTitle, StackedTitle } from "./HeaderTitles.tsx";
import { SpaceSheet } from "./SpaceSheet.tsx";
import { homeColors, homeSpacing } from "./theme.ts";
import "./homeHeader.css";

const headerTheme = {
  "--header-avatar": `${homeSpacing.lg * 2}px`,
  "--header-sm": `${homeSpacing.sm}px`,
  "--header-xs": `${homeSpacing.xs}px`,
  "--header-muted": homeColors.muted,
  "--header-text": homeColors.text,
  "--header-border": homeColors.border,
  "--header-primary": homeColors.primary,
  "--header-primary-text": homeColors.primaryForeground,
} as CSSProperties;

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
  onSpacePress?: () => void;
  onProfile?: () => void;
  useSpaceAsTitle?: boolean;
};

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
  onSpacePress,
  onProfile,
  useSpaceAsTitle,
}: HeaderProps) => {
  const [spaceSheetVisible, setSpaceSheetVisible] = useState(false);

  return (
    <div className="home-header" style={headerTheme}>
      <div className="home-header-row">
        <BackButton
          onBack={onBack}
          leftImageUrl={leftImageUrl}
          leftImageLoading={leftImageLoading}
          hideLeftImagePlaceholder={hideLeftImagePlaceholder}
          onPressLeftImage={onPressLeftImage}
        />
        <div className="home-header-title-stack">
          {useSpaceAsTitle ? (
            <SpaceTitle onPress={() => setSpaceSheetVisible(true)} />
          ) : (
            <StackedTitle title={title} onPress={onPressTitle} onSpacePress={onSpacePress} />
          )}
        </div>
        <AvatarButton email={email} imageUrl={profileImageUrl} onProfile={onProfile} />
      </div>
      <SpaceSheet visible={spaceSheetVisible} onClose={() => setSpaceSheetVisible(false)} />
    </div>
  );
};
