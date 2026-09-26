import { useId } from "react";
import { useTranslation } from "react-i18next";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import "./filterSheet.css";

type MemberSectionProps = {
  members: NamedEntity[];
  selectedMembers: string[];
  onToggle: (id: string) => void;
};

type CategorySectionProps = {
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggle: (id: string) => void;
};

type EntitySectionProps = {
  title: string;
  emptyText: string;
  entities: NamedEntity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export const CategorySection = ({ categories, selectedCategories, onToggle }: CategorySectionProps) => {
  const { t } = useTranslation();
  return (
    <EntitySection
      title={t("filterSection.categories")}
      emptyText={t("filterSection.noCategories")}
      entities={categories}
      selectedIds={selectedCategories}
      onToggle={onToggle}
    />
  );
};

export const MemberSection = ({ members, selectedMembers, onToggle }: MemberSectionProps) => {
  const { t } = useTranslation();
  return (
    <EntitySection
      title={t("filterSection.members")}
      emptyText={t("filterSection.noMembers")}
      entities={members}
      selectedIds={selectedMembers}
      onToggle={onToggle}
    />
  );
};

const EntitySection = ({ title, emptyText, entities, selectedIds, onToggle }: EntitySectionProps) => (
  <section className="filter-section">
    <h3 className="filter-section-title">{title}</h3>
    <div className="filter-section-list">
      {entities.map((entity) => (
        <FilterRow
          key={entity.id}
          item={entity}
          selected={selectedIds.includes(entity.id)}
          onToggle={() => onToggle(entity.id)}
        />
      ))}
      {entities.length === 0 && <p className="filter-empty">{emptyText}</p>}
    </div>
  </section>
);

type FilterRowProps = {
  item: NamedEntity;
  selected: boolean;
  onToggle: () => void;
};

const FilterRow = ({ item, selected, onToggle }: FilterRowProps) => {
  const inputId = useId();
  return (
    <label className="filter-row" htmlFor={inputId}>
      <AppCheckbox id={inputId} checked={selected} label={item.name} onToggle={onToggle} size={16} />
      <span className="filter-row-name">{item.name}</span>
      {getEmojiValue(item.image) ? (
        <span className="filter-row-emoji" aria-hidden="true">
          {getEmojiValue(item.image)}
        </span>
      ) : item.image ? (
        <img className="filter-row-image" src={item.image} alt="" />
      ) : null}
    </label>
  );
};
