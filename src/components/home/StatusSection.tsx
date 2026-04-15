import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = {
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "unpacked", "packed"];

export const StatusSection = ({ statusFilter, onSetStatus }: StatusSectionProps) => {
  const { t } = useTranslation();
  const statusLabels = [t("status.all"), t("status.unpacked"), t("status.packed")];
  return (
    <>
      <Text style={styles.sectionTitle}>{t("status.title")}</Text>
      <SegmentedControl
        values={statusLabels}
        selectedIndex={STATUS_OPTIONS.indexOf(statusFilter)}
        onChange={(e) => onSetStatus(STATUS_OPTIONS[e.nativeEvent.selectedSegmentIndex])}
      />
    </>
  );
};
