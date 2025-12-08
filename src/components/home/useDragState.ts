import { useCallback, useState } from "react";
import { LayoutRectangle } from "react-native";
import { DragOffset } from "./useDraggableRow.tsx";

export type DragSnapshot = { id: string; offsetY: number } | null;

export const useDragState = () => {
    const [snapshot, setSnapshot] = useState<DragSnapshot>(null);
    const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
    const recordLayout = useCallback((id: string, layout: LayoutRectangle) => {
        setLayouts((current) => {
            const previous = current[id];
            if (previous && previous.height === layout.height && previous.y === layout.y) return current;
            return { ...current, [id]: layout };
        });
    }, []);
    const start = useCallback((id: string) => setSnapshot({ id, offsetY: 0 }), []);
    const move = useCallback((id: string, offset: DragOffset) => {
        setSnapshot((current) => (current && current.id === id ? { ...current, offsetY: offset.y } : current));
    }, []);
    const end = useCallback((onComplete?: (value: DragSnapshot) => void) => {
        setSnapshot((current) => {
            if (onComplete) onComplete(current);
            return null;
        });
    }, []);
    return { snapshot, layouts, recordLayout, start, move, end } as const;
};
