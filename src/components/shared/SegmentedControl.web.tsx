import { type CSSProperties } from "react";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import "./segmentedControl.css";

type SegmentedControlProps = {
  label: string;
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

const theme = {
  "--segment-surface": homeColors.surface,
  "--segment-background": homeColors.primaryLight,
  "--segment-text": homeColors.text,
  "--segment-muted": homeColors.muted,
  "--segment-radius": `${homeRadius}px`,
  "--segment-xs": `${homeSpacing.xs}px`,
  "--segment-sm": `${homeSpacing.sm}px`,
} as CSSProperties;

export const SegmentedControl = ({ label, values, selectedIndex, onChange }: SegmentedControlProps) => (
  <fieldset className="segmented-control" style={theme} aria-label={label}>
    {values.map((value, index) => (
      <button
        key={value}
        type="button"
        className={`segmented-control-option${index === selectedIndex ? " segmented-control-selected" : ""}`}
        aria-pressed={index === selectedIndex}
        onClick={() => onChange(index)}
      >
        {value}
      </button>
    ))}
  </fieldset>
);
