import type { NamedEntity } from "~/types/NamedEntity.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const EntityDragGlyph = () => (
  <span className="mdi mdi-drag-vertical" aria-hidden="true" style={{ fontSize: 20, color: homeColors.muted }} />
);

export const EntityMenuGlyph = () => (
  <span className="mdi mdi-dots-vertical" aria-hidden="true" style={{ fontSize: 18, color: homeColors.text }} />
);

export const EntityCardPreview = ({ entity }: { entity: NamedEntity }) => (
  <div
    style={{
      display: "flex",
      flex: 1,
      alignItems: "center",
      gap: homeSpacing.sm,
      padding: homeSpacing.sm,
      border: `1px solid ${homeColors.border}`,
      borderRadius: homeSpacing.sm,
      backgroundColor: homeColors.cardBg,
    }}
  >
    <EntityDragGlyph />
    <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: homeColors.text }}>{entity.name}</span>
    <EntityMenuGlyph />
  </div>
);
