import { type ReactNode, useEffect, useRef } from "react";
import { homeSpacing } from "./theme.ts";

type RowLayout = { x: number; y: number; width: number; height: number };

type ListRowProps = {
  id: string;
  separated: boolean;
  onLayout: (id: string, layout: RowLayout) => void;
  children: ReactNode;
};

export const ListRow = ({ id, separated, onLayout, children }: ListRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      onLayout(id, { x: 0, y: 0, width, height });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [id, onLayout]);
  return (
    <div ref={ref} style={{ marginBottom: separated ? homeSpacing.sm : undefined }}>
      {children}
    </div>
  );
};
