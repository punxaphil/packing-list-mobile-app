import type { CSSProperties } from "react";
import { ImageViewerModal } from "~/components/shared/ImageViewerModal.tsx";
import { useSpace } from "~/providers/SpaceContext.ts";
import { confirmSignOut } from "../home/SignOutButton.tsx";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { CommitVersion } from "./CommitVersion.tsx";
import { DeleteAccountButton } from "./DeleteAccountButton.tsx";
import { FeedbackButton } from "./FeedbackButton.tsx";
import { NameEditor } from "./NameEditor.tsx";
import { PreferencesSection } from "./PreferencesSection.tsx";
import { ProfileAvatar } from "./ProfileAvatar.tsx";
import { profileCopy } from "./profileCopy.ts";
import { useProfileImage } from "./useProfileImage.ts";
import "./profileScreen.css";

type ProfileScreenProps = {
  email: string;
  onSignOut: () => void;
  onBack?: () => void;
  embeddedInSheet?: boolean;
};

const SignOutButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Button label={profileCopy.signOut} onPress={() => confirmSignOut(email, onSignOut)} variant="danger" flex />
);

const theme = {
  "--profile-surface": homeColors.surface,
  "--profile-text": homeColors.text,
  "--profile-muted": homeColors.muted,
  "--profile-sm": `${homeSpacing.sm}px`,
  "--profile-md": `${homeSpacing.md}px`,
  "--profile-lg": `${homeSpacing.lg}px`,
} as CSSProperties;

export const ProfileScreen = ({ email, onSignOut, onBack, embeddedInSheet = false }: ProfileScreenProps) => {
  const { profile } = useSpace();
  const imageUrl = profile?.imageUrl;
  const avatarInitial = email.trim()[0]?.toUpperCase() ?? "?";
  const image = useProfileImage(profile?.id, imageUrl);

  return (
    <div className={`profile-screen${embeddedInSheet ? " profile-screen-embedded" : ""}`} style={theme}>
      {!embeddedInSheet && onBack ? <Header onBack={onBack} /> : null}
      <div className="profile-screen-scroll">
        <main className={`profile-screen-content${embeddedInSheet ? " profile-screen-sheet-content" : ""}`}>
          <ProfileAvatar
            initial={avatarInitial}
            imageUrl={imageUrl}
            onPress={image.openAvatar}
            loading={image.loading}
          />
          <div className="profile-screen-email">{email}</div>
          <NameEditor />
          <PreferencesSection />
          <div className="profile-screen-actions">
            <FeedbackButton />
          </div>
          <div className="profile-screen-actions">
            <SignOutButton email={email} onSignOut={onSignOut} />
            <DeleteAccountButton onSignOut={onSignOut} />
          </div>
          <CommitVersion />
        </main>
      </div>
      <ImageViewerModal
        visible={image.viewerVisible}
        imageUrl={imageUrl}
        placeholderLabel={avatarInitial}
        title={profileCopy.imageTitle}
        connectedLabel={email}
        showRemove={Boolean(imageUrl)}
        loading={image.loading}
        textValue={image.viewerText}
        textSubmitDisabled={!image.viewerText.trim()}
        onTextChange={image.setViewerText}
        onTextSubmit={() => void image.applyViewerText()}
        onClose={image.closeViewer}
        onReplace={image.replaceImage}
        onRemove={image.removeImage}
      />
    </div>
  );
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <header className="profile-screen-header">
    <button className="profile-screen-back" type="button" onClick={onBack}>
      <span className="profile-screen-back-arrow" aria-hidden="true">
        ←
      </span>
      {profileCopy.back}
    </button>
    <h1 className="profile-screen-title">{profileCopy.title}</h1>
    <span className="profile-screen-header-spacer" aria-hidden="true" />
  </header>
);
