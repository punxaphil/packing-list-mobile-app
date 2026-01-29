import { Pressable, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";

type MemberSectionProps = { members: NamedEntity[]; selectedMembers: string[]; onToggle: (id: string) => void };

export const sortSelectedFirst = (entities: NamedEntity[], selected: string[]) => {
  const selectedSet = new Set(selected);
  return [...entities].sort((a, b) => {
    const aSelected = selectedSet.has(a.id);
    const bSelected = selectedSet.has(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
};

export const MemberSection = ({ members, selectedMembers, onToggle }: MemberSectionProps) => (
  <>
    <Text style={styles.sectionTitle}>Members</Text>
    {members.map((member) => (
      <FilterRow
        key={member.id}
        item={member}
        selected={selectedMembers.includes(member.id)}
        onToggle={() => onToggle(member.id)}
      />
    ))}
    {members.length === 0 && <Text style={styles.empty}>No members assigned in this list</Text>}
  </>
);

type FilterRowProps = { item: NamedEntity; selected: boolean; onToggle: () => void };

export const FilterRow = ({ item, selected, onToggle }: FilterRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.rowText}>{item.name}</Text>
  </Pressable>
);
