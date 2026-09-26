import type { ReactNode, RefObject } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeColors } from "./theme.ts";

type Props = {
  title: string;
  headerRef: RefObject<HTMLElement | null>;
  color?: string;
  imageUrl?: string;
  textColor?: string;
  right?: ReactNode;
};

export const ActionMenuHeader = ({ title, headerRef, color, imageUrl, textColor, right }: Props) => (
  <header className="action-menu-header" ref={headerRef} style={{ backgroundColor: color }}>
    <span className="action-menu-header-side">
      {getEmojiValue(imageUrl) ? (
        <span className="action-menu-emoji">{getEmojiValue(imageUrl)}</span>
      ) : imageUrl ? (
        <img className="action-menu-image" src={imageUrl} alt="" />
      ) : null}
    </span>
    <strong style={{ color: color ? (textColor ?? homeColors.text) : homeColors.muted }}>{title}</strong>
    <span className="action-menu-header-side">{right}</span>
  </header>
);
