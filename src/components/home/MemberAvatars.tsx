import { getEmojiValue } from "~/services/mediaValue.ts";
import type { MemberInfo } from "./memberInfo.ts";
import { homeColors } from "./theme.ts";
import "./memberAvatars.css";

const MAX_VISIBLE = 4;
export const MemberAvatars = ({ members }: { members: MemberInfo[] }) => {
  if (!members.length) return null;
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;
  return (
    <div className="space-member-avatars" aria-hidden="true">
      {visible.map((member) => (
        <Avatar key={member.email} email={member.email} imageUrl={member.imageUrl} />
      ))}
      {overflow > 0 && (
        <div
          className="space-member-avatar"
          style={{ backgroundColor: homeColors.muted, color: homeColors.buttonText }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

const Avatar = ({ email, imageUrl }: { email: string; imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  return (
    <div
      className="space-member-avatar"
      style={{ backgroundColor: homeColors.primary, color: homeColors.primaryForeground }}
    >
      {emoji ? (
        <span className="space-member-emoji">{emoji}</span>
      ) : imageUrl ? (
        <img src={imageUrl} alt="" />
      ) : (
        <span>{email[0]?.toUpperCase() ?? "?"}</span>
      )}
    </div>
  );
};
