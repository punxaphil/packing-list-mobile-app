import { useSpace } from "~/providers/SpaceContext.ts";
import { profileCopy } from "../profile/profileCopy.ts";
import { Button } from "../shared/Button.tsx";
import { DisabledQuickAddRow } from "./DisabledQuickAddRow.tsx";
import { HomeHeader } from "./HomeHeader.tsx";
import { homeColors, homeSpacing } from "./theme.ts";
import "./noSelectionPanel.css";

type Props = {
  email: string;
  onProfile: () => void;
  onShowLists: () => void;
};

export const NoSelectionPanel = ({ email, onProfile, onShowLists }: Props) => {
  const { profile } = useSpace();
  return (
    <div className="no-selection-wrapper">
      <div
        className="no-selection-panel"
        style={{ backgroundColor: homeColors.surface, paddingInline: homeSpacing.md, gap: homeSpacing.md }}
      >
        <HomeHeader
          title={profileCopy.noListSelected}
          email={email}
          profileImageUrl={profile?.imageUrl}
          onProfile={onProfile}
        />
        <div className="no-selection-body" style={{ gap: homeSpacing.md }}>
          <DisabledQuickAddRow />
          <div className="no-selection-empty" style={{ paddingBlock: homeSpacing.md, gap: homeSpacing.sm }}>
            <span className="no-selection-message" style={{ color: homeColors.muted }}>
              {profileCopy.noListMessage}
            </span>
            <Button label={profileCopy.showLists} onPress={onShowLists} />
          </div>
        </div>
      </div>
    </div>
  );
};
