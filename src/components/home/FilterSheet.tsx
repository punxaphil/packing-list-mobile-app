import i18next from "i18next";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { filterCopy } from "./copy.ts";
import { CategorySection, MemberSection } from "./FilterComponents.tsx";
import { StatusSection } from "./StatusSection.tsx";
import type { StatusFilter } from "./useFilterDialog.ts";
import "./filterSheet.css";

type FilterSheetProps = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  members: NamedEntity[];
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
  onClear: () => void;
  onClose: () => void;
  shownCount: number;
  totalItemCount: number;
};

export const FilterSheet = (props: FilterSheetProps) => {
  const count = props.selectedCategories.length + props.selectedMembers.length + (props.statusFilter !== "all" ? 1 : 0);
  return (
    <DialogShell
      visible={props.visible}
      title={i18next.t("filter.title")}
      onClose={props.onClose}
      actions={<DialogSingleAction label={filterCopy.done} onPress={props.onClose} />}
    >
      <div className="filter-header">
        <span>
          {i18next.t("filter.itemsShowing", { shownCount: props.shownCount, totalItemCount: props.totalItemCount })}
        </span>
        {count > 0 && (
          <button type="button" onClick={props.onClear}>
            {i18next.t("filter.clear", { count })}
          </button>
        )}
      </div>
      <div className="filter-content">
        <StatusSection statusFilter={props.statusFilter} onSetStatus={props.onSetStatus} />
        <CategorySection
          categories={props.categories}
          selectedCategories={props.selectedCategories}
          onToggle={props.onToggleCategory}
        />
        <MemberSection
          members={props.members}
          selectedMembers={props.selectedMembers}
          onToggle={props.onToggleMember}
        />
      </div>
    </DialogShell>
  );
};
