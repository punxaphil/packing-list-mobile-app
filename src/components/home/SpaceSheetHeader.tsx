import glyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import { commonCopy } from "./copy.ts";
import { homeColors } from "./theme.ts";

export const SpaceSheetHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="space-sheet-header">
    <h2 style={{ color: homeColors.text }}>{title}</h2>
    <button
      type="button"
      className="space-sheet-icon"
      onClick={onClose}
      aria-label={commonCopy.cancel}
      title={commonCopy.cancel}
      style={{ color: homeColors.muted }}
    >
      <span className="web-button-icon" aria-hidden="true">
        {String.fromCodePoint(glyphs.close)}
      </span>
    </button>
  </div>
);
