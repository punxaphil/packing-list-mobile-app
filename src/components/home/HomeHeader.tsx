import { Pressable, Text, View } from "react-native";
import { confirmSignOut } from "./SignOutButton.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";

type HeaderProps = {
  title: string;
  email: string;
  onSignOut: () => void;
  onBack?: () => void;
  onPressTitle?: () => void;
};

const BackButton = ({ onBack }: { onBack?: () => void }) =>
  onBack ? (
    <Pressable
      style={homeStyles.backButton}
      onPress={onBack}
      accessibilityRole="button"
      hitSlop={8}
    >
      <Text style={homeStyles.backText}>{HOME_COPY.back}</Text>
    </Pressable>
  ) : (
    <View style={homeStyles.backPlaceholder} />
  );

const AvatarButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Pressable
    style={homeStyles.avatar}
    onPress={() => confirmSignOut(email, onSignOut)}
    accessibilityRole="button"
    hitSlop={8}
  >
    <Text style={homeStyles.avatarLabel}>{buildInitial(email)}</Text>
  </Pressable>
);

const buildInitial = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed) return HOME_COPY.avatarFallback;
  return trimmed[0]?.toUpperCase() ?? HOME_COPY.avatarFallback;
};

const Title = ({ title, onPress }: { title: string; onPress?: () => void }) => (
  onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}>
      <Text style={homeStyles.panelTitle} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  ) : (
    <Text style={homeStyles.panelTitle} numberOfLines={1}>
      {title}
    </Text>
  )
);

export const HomeHeader = ({ title, email, onSignOut, onBack, onPressTitle }: HeaderProps) => (
  <View style={homeStyles.panelHeader}>
    <BackButton onBack={onBack} />
    <Title title={title} onPress={onPressTitle} />
    <AvatarButton email={email} onSignOut={onSignOut} />
  </View>
);
