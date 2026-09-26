import type { useFlashHighlight } from "../shared/useFlashHighlight.ts";
import "./itemRowHighlight.css";

type HighlightOpacity = ReturnType<typeof useFlashHighlight>["highlightOpacity"];

export const ItemRowHighlight = ({ opacity }: { opacity?: HighlightOpacity }) => {
  return opacity ? <div className="item-row-highlight" /> : null;
};
