import { type CSSProperties, useMemo } from "react";
import { useCategories } from "~/hooks/useCategories.ts";
import { useChanges } from "~/hooks/useChanges.ts";
import { useImages } from "~/hooks/useImages.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { ChangeRow } from "./ChangeRow.tsx";
import { changeCopy } from "./changeCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./listChanges.css";

type Props = { spaceId: string; packingListId: string; onBack: () => void };

const useCategoryNames = (spaceId: string) => {
  const { categories } = useCategories(spaceId);
  return useMemo(() => {
    const map = new Map<string, string>([
      ["", changeCopy.uncategorized],
      [UNCATEGORIZED.id, changeCopy.uncategorized],
    ]);
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);
};

const useUserImages = (spaceId: string) => {
  const { images } = useImages(spaceId);
  const { members } = useMembers(spaceId);
  return useMemo(() => {
    const byMemberId = new Map<string, string>();
    for (const image of images) if (image.type === "members") byMemberId.set(image.typeId, image.url);
    const byUserId = new Map<string, string>();
    for (const member of members) {
      const url = byMemberId.get(member.id);
      if (url) byUserId.set(member.userId ?? member.id, url);
    }
    return byUserId;
  }, [images, members]);
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <header className="list-changes-header">
    <button className="list-changes-back" type="button" onClick={onBack}>
      <span className="list-changes-back-arrow" aria-hidden="true">
        ←
      </span>
      {changeCopy.back}
    </button>
    <h1 className="list-changes-title">{changeCopy.title}</h1>
    <span aria-hidden="true" />
  </header>
);

const theme = {
  "--changes-surface": homeColors.surface,
  "--changes-text": homeColors.text,
  "--changes-muted": homeColors.muted,
  "--changes-primary": homeColors.primary,
  "--changes-primary-strong": homeColors.primaryStrong,
  "--changes-primary-foreground": homeColors.primaryForeground,
  "--changes-sm": `${homeSpacing.sm}px`,
  "--changes-md": `${homeSpacing.md}px`,
  "--changes-lg": `${homeSpacing.lg}px`,
} as CSSProperties;

export const ListChangesScreen = ({ spaceId, packingListId, onBack }: Props) => {
  const { changes } = useChanges(spaceId, packingListId);
  const categoryNames = useCategoryNames(spaceId);
  const memberImages = useUserImages(spaceId);
  return (
    <main className="list-changes" style={theme}>
      <Header onBack={onBack} />
      {changes.length === 0 ? (
        <p className="list-changes-empty">{changeCopy.empty}</p>
      ) : (
        <ul className="list-changes-scroll">
          {changes.map((entry) => (
            <ChangeRow
              key={entry.id}
              entry={entry}
              categoryName={categoryNames.get(entry.categoryId) ?? changeCopy.uncategorized}
              fromCategoryName={
                entry.fromCategoryId === undefined
                  ? undefined
                  : (categoryNames.get(entry.fromCategoryId) ?? changeCopy.uncategorized)
              }
              imageUrl={memberImages.get(entry.userId)}
            />
          ))}
        </ul>
      )}
    </main>
  );
};
