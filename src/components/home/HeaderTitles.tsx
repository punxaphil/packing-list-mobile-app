import { useInvites } from "~/providers/InviteContext.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { spaceCopy } from "./spaceCopy.ts";

type TitleProps = { title: string; onPress?: () => void; onSpacePress?: () => void };

export const StackedTitle = ({ title, onPress, onSpacePress }: TitleProps) => (
  <>
    <SpaceBar onPress={onSpacePress} />
    {onPress ? (
      <button type="button" className="home-header-title-button" onClick={onPress}>
        <span className="home-header-title">{title}</span>
      </button>
    ) : (
      <span className="home-header-title">{title}</span>
    )}
  </>
);

export const SpaceTitle = ({ onPress }: { onPress: () => void }) => {
  const { activeSpace } = useSpace();
  return (
    <button type="button" className="home-header-space-title" onClick={onPress}>
      <span className="home-header-title">{activeSpace?.name ?? ""}</span>
      <span className="home-header-chevron">{spaceCopy.chevron}</span>
    </button>
  );
};

const SpaceBar = ({ onPress }: { onPress?: () => void }) => {
  const { activeSpace } = useSpace();
  const { pendingInvites } = useInvites();
  const content = (
    <>
      <span className="home-header-space-name">{activeSpace?.name ?? ""}</span>
      {onPress && <span className="home-header-small-chevron">{spaceCopy.chevron}</span>}
      {pendingInvites.length > 0 && <span className="home-header-invite-badge">{pendingInvites.length}</span>}
    </>
  );
  return onPress ? (
    <button type="button" className="home-header-space-bar" onClick={onPress}>
      {content}
    </button>
  ) : (
    <div className="home-header-space-bar">{content}</div>
  );
};
