import { useEffect, useRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { Button } from "../shared/Button.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { CategorySection, MemberSection } from "./FilterComponents.tsx";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import { StatusSection } from "./StatusSection.tsx";
import type { StatusFilter } from "./useFilterDialog.ts";

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
  const totalCount =
    props.selectedCategories.length +
    props.selectedMembers.length +
    (props.statusFilter !== "all" ? 1 : 0);
  const categoryScrollRef = useRef<ScrollView>(null);
  const memberScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (props.visible) {
      setTimeout(() => {
        categoryScrollRef.current?.flashScrollIndicators();
        memberScrollRef.current?.flashScrollIndicators();
      }, 100);
    }
  }, [props.visible]);

  if (Platform.OS === "ios") {
    return (
      <PageSheet
        visible={props.visible}
        title="Filters"
        onClose={props.onClose}
        confirmLabel="Done"
        onConfirm={props.onClose}
        scrollable={false}
      >
        <SheetHeader
          count={totalCount}
          onClear={props.onClear}
          shownCount={props.shownCount}
          totalItemCount={props.totalItemCount}
          iosSheet
        />
        <FilterContent
          {...props}
          categoryScrollRef={categoryScrollRef}
          memberScrollRef={memberScrollRef}
          sortedCategories={props.categories}
          sortedMembers={props.members}
        />
      </PageSheet>
    );
  }

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <Pressable style={styles.backdrop} onPress={props.onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <SheetHeader
            count={totalCount}
            onClear={props.onClear}
            shownCount={props.shownCount}
            totalItemCount={props.totalItemCount}
          />
          <FilterContent
            {...props}
            categoryScrollRef={categoryScrollRef}
            memberScrollRef={memberScrollRef}
            sortedCategories={props.categories}
            sortedMembers={props.members}
          />
          <DoneButton onPress={props.onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

type SheetHeaderProps = {
  count: number;
  onClear: () => void;
  shownCount: number;
  totalItemCount: number;
  iosSheet?: boolean;
};

const SheetHeader = ({
  count,
  onClear,
  shownCount,
  totalItemCount,
  iosSheet = false,
}: SheetHeaderProps) => (
  <View style={iosSheet ? styles.sheetHeader : styles.header}>
    <Text style={styles.itemCount}>
      {shownCount} items showing (of {totalItemCount})
    </Text>
    {count > 0 && (
      <Pressable onPress={onClear} hitSlop={8}>
        <Text style={styles.clearText}>Clear ({count})</Text>
      </Pressable>
    )}
  </View>
);

type FilterContentProps = FilterSheetProps & {
  categoryScrollRef: React.RefObject<ScrollView | null>;
  memberScrollRef: React.RefObject<ScrollView | null>;
  sortedCategories: NamedEntity[];
  sortedMembers: NamedEntity[];
};

const FilterContent = ({
  categoryScrollRef,
  memberScrollRef,
  sortedCategories,
  sortedMembers,
  ...props
}: FilterContentProps) => (
  <View style={styles.content}>
    <StatusSection
      statusFilter={props.statusFilter}
      onSetStatus={props.onSetStatus}
    />
    <CategorySection
      categories={sortedCategories}
      selectedCategories={props.selectedCategories}
      onToggle={props.onToggleCategory}
      scrollRef={categoryScrollRef}
    />
    <MemberSection
      members={sortedMembers}
      selectedMembers={props.selectedMembers}
      onToggle={props.onToggleMember}
      scrollRef={memberScrollRef}
    />
  </View>
);

const DoneButton = ({ onPress }: { onPress: () => void }) => (
  <Button variant="primary" label="Done" onPress={onPress} />
);
