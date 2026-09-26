import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { commonCopy } from "./copy.ts";
import { QuickRowIconButton } from "./QuickRowIconButton.tsx";
import { homeColors, homeSpacing } from "./theme.ts";
import type { SearchState } from "./useSearch.ts";
import "./searchRow.css";

type Props = {
  localText: string;
  search: SearchState;
  inputRef: RefObject<HTMLInputElement | null>;
  onTextChange: (text: string) => void;
  onClearSearch: () => void;
  onSubmitSearch: () => void;
  onClose: () => void;
  onUndo: () => void;
  canUndo: boolean;
};

export const SearchRow = (props: Props) => {
  const { localText, search, inputRef, onTextChange, onClearSearch, onSubmitSearch, onClose, onUndo, canUndo } = props;
  const { t } = useTranslation();
  const hasText = localText.length > 0;
  const hasMatches = search.totalMatches > 0;
  return (
    <div className="quick-search-row" style={{ color: homeColors.muted, gap: homeSpacing.xs }}>
      <div className="quick-search-field" style={{ background: homeColors.background, paddingInline: homeSpacing.sm }}>
        <span className="quick-search-icon mdi mdi-magnify" aria-hidden="true" />
        <input
          ref={inputRef}
          className="quick-search-input"
          style={{ color: homeColors.text, padding: homeSpacing.sm }}
          type="search"
          value={localText}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmitSearch();
          }}
          aria-label={t("search.placeholder")}
        />
        {hasText && localText === search.searchText && !hasMatches && (
          <span className="quick-search-no-match" style={{ color: homeColors.danger }}>
            {t("search.noMatches")}
          </span>
        )}
        {hasMatches && (
          <span className="quick-search-count">
            {search.currentIndex + 1}/{search.totalMatches}
          </span>
        )}
        {hasText && hasMatches && search.totalMatches > 1 && (
          <>
            <QuickRowIconButton name="chevron-up" label={t("search.previous")} onPress={search.onPrev} />
            <QuickRowIconButton name="chevron-down" label={t("search.next")} onPress={search.onNext} />
          </>
        )}
        {hasText && <QuickRowIconButton name="close-circle" label={t("search.clear")} onPress={onClearSearch} />}
      </div>
      <QuickRowIconButton name="undo" label={commonCopy.undo} onPress={onUndo} disabled={!canUndo} />
      <QuickRowIconButton name="close" label={t("search.close")} onPress={onClose} />
    </div>
  );
};
