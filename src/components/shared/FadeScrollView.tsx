import { type CSSProperties, forwardRef, type ReactNode, type UIEvent, useImperativeHandle, useRef } from "react";
import { TAB_BAR_HEIGHT } from "~/components/home/theme.ts";
import type { useDragState } from "../home/useDragState.ts";
import { useDragEdgeScroll } from "./useDragEdgeScroll.ts";
import "./fadeScrollView.css";

type FadeScrollViewProps = {
  children: ReactNode;
  style?: CSSProperties;
  contentContainerStyle?: CSSProperties;
  scrollEnabled?: boolean;
  drag?: ReturnType<typeof useDragState>;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
};

export type FadeScrollViewRef = {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
  scrollToEnd: (options?: { animated?: boolean }) => void;
};

export const FadeScrollView = forwardRef<FadeScrollViewRef, FadeScrollViewProps>(
  ({ children, style, contentContainerStyle, scrollEnabled = true, onScroll, drag }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useDragEdgeScroll(scrollRef, drag);
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: ({ y, animated }) =>
          scrollRef.current?.scrollTo({ top: y, behavior: animated ? "smooth" : "instant" }),
        scrollToEnd: ({ animated } = {}) =>
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: animated ? "smooth" : "instant",
          }),
      }),
      []
    );
    return (
      <div className="fade-scroll" style={style}>
        <div
          className="fade-scroll-viewport"
          ref={scrollRef}
          onScroll={onScroll}
          style={{ overflowY: scrollEnabled ? "auto" : "hidden" }}
        >
          <div style={{ paddingBottom: TAB_BAR_HEIGHT, ...contentContainerStyle }}>{children}</div>
        </div>
      </div>
    );
  }
);
