import { type CSSProperties, useEffect, useRef, useState } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { Image } from "~/types/Image.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { isAnimatingLayout } from "./layoutAnimation.ts";
import { computeMaxChars, RESERVED_END_SPACE, shouldWrapBadges, truncateName } from "./memberBadgeLayout.ts";
import type { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./memberInitials.css";

type MemberInitialsProps = {
  item: PackItem;
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  memberImages: Image[];
  checkedColor: string;
  onToggle: (memberId: string) => void;
};

export const MemberInitials = ({
  item,
  initialsMap,
  memberNames,
  memberImages,
  checkedColor,
  onToggle,
}: MemberInitialsProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const hasMembers = item.members.length > 0;
  useEffect(() => {
    if (!hasMembers) return;
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!isAnimatingLayout()) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [hasMembers]);
  if (!hasMembers) return null;

  const availableWidth = Math.max(0, containerWidth - RESERVED_END_SPACE);
  const maxChars = computeMaxChars(availableWidth, item.members, memberImages);
  const shouldWrap = shouldWrapBadges(availableWidth, item.members, memberImages, maxChars);

  return (
    <div
      ref={rowRef}
      className={`member-initials${shouldWrap ? " member-initials-wrap" : ""}`}
      style={{ "--member-gap": `${homeSpacing.sm}px`, "--member-small": `${homeSpacing.xs}px` } as CSSProperties}
    >
      {item.members.map((member) => {
        const fullName = memberNames.get(member.id) ?? initialsMap.get(member.id) ?? "?";
        const imageUrl = memberImages.find((image) => image.typeId === member.id)?.url;
        return (
          <button
            type="button"
            key={member.id}
            className="member-badge"
            title={fullName}
            aria-label={fullName}
            aria-pressed={member.checked}
            style={
              {
                "--member-badge-background": member.checked ? checkedColor : homeColors.border,
                "--member-badge-text": member.checked ? homeColors.buttonText : homeColors.text,
              } as CSSProperties
            }
            onClick={() => onToggle(member.id)}
          >
            {getEmojiValue(imageUrl) || (imageUrl && <img src={imageUrl} alt="" className="member-badge-image" />)}
            <span className="member-badge-label">{truncateName(fullName, maxChars)}</span>
          </button>
        );
      })}
    </div>
  );
};
