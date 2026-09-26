import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "~/components/shared/SegmentedControl";
import { homeColors, homeSpacing } from "./theme.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = {
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "unpacked", "packed"];
const titleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: homeColors.muted,
  marginBottom: homeSpacing.xs,
} as CSSProperties;

export const StatusSection = ({ statusFilter, onSetStatus }: StatusSectionProps) => {
  const { t } = useTranslation();
  const statusLabels = [t("status.all"), t("status.unpacked"), t("status.packed")];
  return (
    <>
      <span style={titleStyle}>{t("status.title")}</span>
      <SegmentedControl
        label={t("status.title")}
        values={statusLabels}
        selectedIndex={STATUS_OPTIONS.indexOf(statusFilter)}
        onChange={(index) => onSetStatus(STATUS_OPTIONS[index])}
      />
    </>
  );
};
