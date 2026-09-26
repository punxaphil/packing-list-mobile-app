import type { ChangeLogEntry } from "~/services/changeLog.ts";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { changeActionVerb, changeCopy } from "./changeCopy.ts";

type Props = { entry: ChangeLogEntry; categoryName: string; fromCategoryName?: string; imageUrl?: string };

const Avatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji)
    return (
      <span className="list-changes-avatar list-changes-emoji" aria-hidden="true">
        {emoji}
      </span>
    );
  if (imageUrl) return <img src={imageUrl} className="list-changes-avatar" alt="" />;
  return (
    <span className="list-changes-avatar list-changes-initial" aria-hidden="true">
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
};

export const ChangeRow = ({ entry, categoryName, fromCategoryName, imageUrl }: Props) => (
  <li className="list-changes-row">
    <Avatar name={entry.userName} imageUrl={imageUrl} />
    <p className="list-changes-text">
      <strong className="list-changes-name">{entry.userName}</strong>
      {` ${changeActionVerb(entry.action)} `}
      <strong className="list-changes-item">{entry.itemName}</strong>
      {entry.action === "moved" && fromCategoryName
        ? ` ${changeCopy.from} ${fromCategoryName} ${changeCopy.to} ${categoryName}`
        : ` (${categoryName})`}
    </p>
  </li>
);
