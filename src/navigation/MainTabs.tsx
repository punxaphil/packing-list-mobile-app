import "@mdi/font/css/materialdesignicons.css";
import i18next from "i18next";
import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { homeColors, homeSpacing } from "~/components/home/theme.ts";
import { TAB_SELECTED_TEXT_COLOR, type TabIconName } from "./tabIcons.ts";
import "./mainTabs.css";

const tabs: { path: string; label: string; icon: TabIconName }[] = [
  { path: "ItemsStack", label: "navigation.items", icon: "checkbox-marked-outline" },
  { path: "ListsStack", label: "navigation.lists", icon: "format-list-bulleted" },
  { path: "CategoriesStack", label: "navigation.categories", icon: "view-grid-outline" },
  { path: "MembersStack", label: "navigation.members", icon: "heart-outline" },
];

export const MainTabs = () => (
  <div
    className="main-tabs"
    style={
      {
        "--tabs-muted": homeColors.muted,
        "--tabs-active": TAB_SELECTED_TEXT_COLOR,
        "--tabs-border": homeColors.border,
        "--tabs-surface": homeColors.surface,
        "--tabs-padding": `${homeSpacing.md}px`,
      } as CSSProperties
    }
  >
    <main className="main-tabs-content">
      <Outlet />
    </main>
    <nav className="main-tabs-bar">
      {tabs.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={`/MainTabs/${path}`}
          className={({ isActive }) => `main-tabs-link${isActive ? " main-tabs-link-active" : ""}`}
        >
          <span className={`mdi mdi-${icon}`} aria-hidden="true" />
          <span>{i18next.t(label)}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);
