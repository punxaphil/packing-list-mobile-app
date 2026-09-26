import "@mdi/font/css/materialdesignicons.css";
import { HOME_COPY } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

const DISABLED_COLOR = homeColors.border;
const DISABLED_ICONS = ["information-outline", "magnify", "filter-variant"] as const;

export const DisabledQuickAddRow = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ paddingBlock: homeSpacing.xs / 2 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: DISABLED_COLOR }}>{HOME_COPY.addItemQuick}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: homeSpacing.xs }}>
      {DISABLED_ICONS.map((name) => (
        <span
          key={name}
          className={`mdi mdi-${name}`}
          style={{ padding: homeSpacing.xs, fontSize: 20, color: DISABLED_COLOR }}
          aria-hidden="true"
        />
      ))}
    </div>
  </div>
);
