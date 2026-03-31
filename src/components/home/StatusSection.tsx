import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Text } from "react-native";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import type { StatusFilter } from "./useFilterDialog.ts";

type StatusSectionProps = {
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "unpacked", "packed"];
const STATUS_LABELS = ["All", "Unpacked", "Packed"];

export const StatusSection = ({
  statusFilter,
  onSetStatus,
}: StatusSectionProps) => (
  <>
    <Text style={styles.sectionTitle}>Status</Text>
    <SegmentedControl
      values={STATUS_LABELS}
      selectedIndex={STATUS_OPTIONS.indexOf(statusFilter)}
      onChange={(e) =>
        onSetStatus(STATUS_OPTIONS[e.nativeEvent.selectedSegmentIndex])
      }
    />
  </>
);
