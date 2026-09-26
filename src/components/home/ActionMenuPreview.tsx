import { useSyncExternalStore } from "react";
import { homeSpacing } from "./theme.ts";
import "./actionMenu.css";

const LINE_HEIGHT = homeSpacing.lg;
const ACTIONS_HEIGHT = 2 * (2 * homeSpacing.md + LINE_HEIGHT + 1);
const PREVIEW_PADDING = 2 * homeSpacing.sm;

type PreviewItem = { id: string; name: string };
const subscribe = (notify: () => void) => {
  window.addEventListener("resize", notify);
  return () => window.removeEventListener("resize", notify);
};

export const getPreviewLines = (items: PreviewItem[], lineCount: number): PreviewItem[] => {
  if (lineCount < 1) return [];
  if (items.length <= lineCount) return items;
  return [...items.slice(0, lineCount - 1), { id: "overflow", name: "..." }];
};

export const ActionMenuPreview = ({ items, headerHeight }: { items: PreviewItem[]; headerHeight: number }) => {
  const height = useSyncExternalStore(
    subscribe,
    () => window.innerHeight,
    () => 0
  );
  const availableHeight = height - 2 * homeSpacing.lg - headerHeight - ACTIONS_HEIGHT - PREVIEW_PADDING;
  const lines = getPreviewLines(items, Math.floor(availableHeight / LINE_HEIGHT));
  if (!lines.length) return null;
  return (
    <div className="action-menu-preview">
      {lines.map((line) => (
        <span key={line.id} className="action-menu-preview-text">
          {line.name}
        </span>
      ))}
    </div>
  );
};
