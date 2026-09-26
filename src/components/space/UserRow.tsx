import { useTranslation } from "react-i18next";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

type UserRowProps = { email: string; isSelf: boolean; imageUrl?: string; onRemove?: () => void; canRemove: boolean };

export const UserRow = ({ email, isSelf, imageUrl, onRemove, canRemove }: UserRowProps) => {
  const { t } = useTranslation();
  const emoji = getEmojiValue(imageUrl);
  return (
    <div className="space-user-row" style={{ gap: homeSpacing.sm, paddingBlock: homeSpacing.xs }}>
      <div
        className="space-user-avatar"
        style={{ backgroundColor: homeColors.primary, color: homeColors.primaryForeground }}
        aria-hidden="true"
      >
        {emoji ? (
          <span className="space-user-emoji">{emoji}</span>
        ) : imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <span>{email[0]?.toUpperCase() ?? "?"}</span>
        )}
      </div>
      <span className="space-user-email" title={email} style={{ color: homeColors.text }}>
        {email}
        {isSelf ? t("userList.youSuffix") : ""}
      </span>
      {canRemove && !isSelf && (
        <button
          type="button"
          className="space-user-remove"
          aria-label={`${SPACE_MGMT_COPY.remove} ${email}`}
          style={{ color: homeColors.danger }}
          onClick={onRemove}
        >
          {SPACE_MGMT_COPY.remove}
        </button>
      )}
    </div>
  );
};
