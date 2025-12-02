import { useCallback, useMemo, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { Animated } from "react-native";
import {
    LongPressGestureHandler,
    LongPressGestureHandlerStateChangeEvent,
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
    State,
} from "react-native-gesture-handler";

export type DragOffset = { x: number; y: number };

type DragCallbacks = {
    onStart?: () => void;
    onMove?: (offset: DragOffset) => void;
    onEnd?: () => void;
};

type DragOptions = {
    applyTranslation?: boolean;
};

export const useDraggableRow = (callbacks: DragCallbacks = {}, options: DragOptions = {}) => {
    const position = useRef(new Animated.ValueXY()).current;
    const [active, setActive] = useState(false);
    const hasEnded = useRef(false);
    const longPressRef = useRef<LongPressGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);
    const reset = useReset(position, hasEnded, callbacks.onEnd);
    const longPress = useLongPress(setActive, callbacks.onStart, reset, hasEnded);
    const pan = usePan(position, active, callbacks.onMove, setActive, reset);
    const applyTranslation = options.applyTranslation ?? true;
    const style = useMemo(() => (applyTranslation ? [{ transform: position.getTranslateTransform() }] : undefined), [applyTranslation, position]);
    const wrap = useCallback((node: ReactNode) => wrapNode(node, longPressRef, panRef, longPress, pan, style), [longPress, pan, style]);
    return { wrap, dragging: active } as const;
};

const useReset = (position: Animated.ValueXY, hasEnded: MutableRefObject<boolean>, onEnd?: () => void) =>
    useCallback(() => {
        if (hasEnded.current) return;
        hasEnded.current = true;
        onEnd?.();
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    }, [position, onEnd, hasEnded]);

const useLongPress = (
    setActive: (value: boolean) => void,
    onStart: DragCallbacks["onStart"],
    reset: () => void,
    hasEnded: MutableRefObject<boolean>,
) =>
    useMemo(
        () => ({
            minDurationMs: 250,
            maxDist: Number.MAX_SAFE_INTEGER,
            shouldCancelWhenOutside: false,
            onHandlerStateChange: ({ nativeEvent }: LongPressGestureHandlerStateChangeEvent) =>
                handleLongPress(nativeEvent.state, setActive, onStart, reset, hasEnded),
        }),
        [setActive, onStart, reset, hasEnded],
    );

const handleLongPress = (
    state: number,
    setActive: (value: boolean) => void,
    onStart: DragCallbacks["onStart"],
    reset: () => void,
    hasEnded: MutableRefObject<boolean>,
) => {
    if (state === State.ACTIVE) {
        hasEnded.current = false;
        setActive(true);
        onStart?.();
        return;
    }
    if (isTerminal(state)) {
        setActive(false);
        reset();
    }
};

const usePan = (
    position: Animated.ValueXY,
    active: boolean,
    onMove: DragCallbacks["onMove"],
    setActive: (value: boolean) => void,
    reset: () => void,
) =>
    useMemo(
        () => ({
            onGestureEvent: (event: PanGestureHandlerGestureEvent) => handlePanMove(event, active, position, onMove),
            onHandlerStateChange: ({ nativeEvent }: PanGestureHandlerStateChangeEvent) =>
                handlePanState(nativeEvent.state, setActive, reset),
        }),
        [active, position, onMove, setActive, reset],
    );

const handlePanMove = (
    event: PanGestureHandlerGestureEvent,
    active: boolean,
    position: Animated.ValueXY,
    onMove: DragCallbacks["onMove"],
) => {
    if (!active) return;
    const { translationX, translationY } = event.nativeEvent;
    position.setValue({ x: translationX, y: translationY });
    onMove?.({ x: translationX, y: translationY });
};

const handlePanState = (
    state: number,
    setActive: (value: boolean) => void,
    reset: () => void,
) => {
    if (!isTerminal(state)) return;
    setActive(false);
    reset();
};

const isTerminal = (state: number) =>
    state === State.END || state === State.CANCELLED || state === State.FAILED;

const wrapNode = (
    node: ReactNode,
    longPressRef: MutableRefObject<LongPressGestureHandler | null>,
    panRef: MutableRefObject<PanGestureHandler | null>,
    longPress: ReturnType<typeof useLongPress>,
    pan: ReturnType<typeof usePan>,
    style?: Animated.WithAnimatedObject<Animated.AnimatedProps<Record<string, unknown>>>[],
) => (
    <LongPressGestureHandler ref={longPressRef} simultaneousHandlers={panRef} {...longPress}>
        <Animated.View>
            <PanGestureHandler ref={panRef} simultaneousHandlers={longPressRef} {...pan}>
                <Animated.View style={style}>{node}</Animated.View>
            </PanGestureHandler>
        </Animated.View>
    </LongPressGestureHandler>
);
