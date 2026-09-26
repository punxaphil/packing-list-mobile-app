import { useRef } from "react";
import { PageSheet } from "../shared/PageSheet.tsx";
import { listCopy } from "./listCopy.ts";
import "./listNotesSheet.css";

export type ListNotesState = {
  visible: boolean;
  notes: string;
  showNotes: boolean;
  open: () => void;
  close: () => void;
  setNotes: (v: string) => void;
  setShowNotes: (v: boolean) => void;
};

export const ListNotesSheet = ({ state }: { state: ListNotesState }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const expandInput = (input: HTMLTextAreaElement) => {
    const previousHeight = input.clientHeight;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
    if (input.clientHeight > previousHeight)
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <PageSheet
      visible={state.visible}
      title={listCopy.title}
      onClose={state.close}
      scrollViewRef={scrollRef}
      onShow={() => {
        if (inputRef.current) {
          expandInput(inputRef.current);
          inputRef.current.focus();
        }
      }}
    >
      <div className="list-notes-content">
        <label className="list-notes-toggle">
          <span>{listCopy.showNotes}</span>
          <input
            type="checkbox"
            role="switch"
            aria-checked={state.showNotes}
            checked={state.showNotes}
            onChange={(event) => state.setShowNotes(event.target.checked)}
          />
        </label>
        <label className="list-notes-label" htmlFor="list-notes-input">
          {listCopy.notesLabel}
        </label>
        <textarea
          id="list-notes-input"
          ref={inputRef}
          className="list-notes-input"
          value={state.notes}
          onChange={(event) => state.setNotes(event.target.value)}
          onInput={(event) => expandInput(event.currentTarget)}
        />
      </div>
    </PageSheet>
  );
};
