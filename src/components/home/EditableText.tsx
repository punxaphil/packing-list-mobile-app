import { RefObject, useEffect, useRef, useState } from "react";
import { Pressable, StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";

type EditableTextProps = {
  value: string;
  displayValue?: string;
  onSubmit: (value: string) => void;
  textStyle: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  autoFocus?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

type EditableState = {
  editing: boolean;
  setEditing: (value: boolean) => void;
  text: string;
  setText: (value: string) => void;
  inputRef: RefObject<TextInput | null>;
};

export const EditableText = (props: EditableTextProps) => {
  const state = useEditableState(props.value, props.autoFocus);
  const finish = createFinishHandler(props, state);
  return (
    <View style={props.containerStyle}>
      {state.editing ? (
        <EditableInput {...props} {...state} onFinish={finish} />
      ) : (
        <EditableLabel
          value={state.text}
          displayValue={props.displayValue}
          textStyle={props.textStyle}
          onStart={() => handleStart(props, state)}
        />
      )}
    </View>
  );
};

const useEditableState = (value: string, autoFocus?: boolean): EditableState => {
  const [editing, setEditing] = useState(Boolean(autoFocus));
  const [text, setText] = useState(value);
  const inputRef = useRef<TextInput>(null);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (autoFocus) setEditing(true);
  }, [autoFocus]);
  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [editing]);
  return { editing, setEditing, text, setText, inputRef };
};

const handleStart = (props: EditableTextProps, state: EditableState) => {
  props.onStart?.();
  state.setEditing(true);
};

const createFinishHandler = (props: EditableTextProps, state: EditableState) => () => {
  const trimmed = state.text.trim();
  if (!trimmed) state.setText(props.value);
  else if (trimmed !== props.value) props.onSubmit(trimmed);
  state.setEditing(false);
  props.onEnd?.();
};

const EditableInput = ({
  text,
  setText,
  inputRef,
  onFinish,
  textStyle,
  inputStyle,
}: EditableTextProps & EditableState & { onFinish: () => void }) => (
  <TextInput
    ref={inputRef}
    value={text}
    onChangeText={setText}
    onBlur={onFinish}
    onSubmitEditing={onFinish}
    style={[textStyle, inputStyle]}
    returnKeyType="done"
  />
);

const EditableLabel = ({
  value,
  displayValue,
  textStyle,
  onStart,
}: Pick<EditableTextProps, "value" | "displayValue" | "textStyle" | "onStart">) => (
  <Pressable onPress={onStart} accessibilityRole="button">
    <Text style={textStyle} numberOfLines={1}>
      {displayValue ?? value}
    </Text>
  </Pressable>
);
