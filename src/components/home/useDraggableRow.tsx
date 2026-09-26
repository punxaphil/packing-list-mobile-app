import { type KeyboardEvent, type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { homeCopy } from "./copy.ts";
import { homeSpacing } from "./theme.ts";
import "./dragHandle.css";

export type DragOffset = { x: number; y: number; absoluteY: number };

type DragCallbacks = {
  onStart?: () => void;
  onMove?: (offset: DragOffset) => void;
  onEnd?: () => void;
};

type DragOptions = { applyTranslation?: boolean };
type PointerPosition = { id: number; x: number; y: number };
const LONG_PRESS_MS = 250;

export const useDraggableRow = (callbacks: DragCallbacks = {}, options: DragOptions = {}) => {
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startPosition = useRef<PointerPosition | null>(null);
  const currentOffset = useRef({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const finish = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    startPosition.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    setOffset({ x: 0, y: 0 });
    currentOffset.current = { x: 0, y: 0 };
    callbacks.onEnd?.();
  }, [callbacks]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startPosition.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    timer.current = setTimeout(() => {
      dragging.current = true;
      setActive(true);
      callbacks.onStart?.();
    }, LONG_PRESS_MS);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = startPosition.current;
    if (!dragging.current || !start || event.pointerId !== start.id) return;
    const next = { x: event.clientX - start.x, y: event.clientY - start.y };
    currentOffset.current = next;
    if (options.applyTranslation !== false) setOffset(next);
    callbacks.onMove?.({ ...next, absoluteY: event.clientY });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && dragging.current) {
      callbacks.onMove?.({ x: 0, y: 0, absoluteY: event.currentTarget.getBoundingClientRect().top });
      finish();
    } else if (dragging.current && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      const y = currentOffset.current.y + (event.key === "ArrowDown" ? homeSpacing.lg * 2 : -homeSpacing.lg * 2);
      currentOffset.current = { x: 0, y };
      if (options.applyTranslation !== false) setOffset(currentOffset.current);
      callbacks.onMove?.({ x: 0, y, absoluteY: event.currentTarget.getBoundingClientRect().top + y });
    } else if (event.key === " " || event.key === "Enter") {
      if (dragging.current) finish();
      else {
        dragging.current = true;
        setActive(true);
        callbacks.onStart?.();
      }
    } else return;
    event.preventDefault();
  };
  const wrap = (node: ReactNode) => (
    <button
      type="button"
      className="dom-drag-handle"
      aria-label={homeCopy.dragHandleLabel}
      aria-pressed={active}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onKeyDown={onKeyDown}
      style={options.applyTranslation === false ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {node}
    </button>
  );
  return { wrap, dragging: active } as const;
};
