import { type CSSProperties, cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { homeColors, homeSpacing } from "../home/theme.ts";
import "./formField.css";

type FormFieldProps =
  | { label: string; group: true; children: ReactNode }
  | { label: string; group?: false; children: ReactElement<{ id?: string }> };

const fieldStyle = { "--field-gap": `${homeSpacing.sm}px` } as CSSProperties;

export const FormField = (props: FormFieldProps) => {
  const inputId = useId();
  if (props.group)
    return (
      <fieldset className="form-field" style={fieldStyle}>
        <legend className="form-field-label" style={{ color: homeColors.muted }}>
          {props.label}
        </legend>
        {props.children}
      </fieldset>
    );
  return (
    <div className="form-field" style={fieldStyle}>
      <label className="form-field-label" htmlFor={inputId} style={{ color: homeColors.muted }}>
        {props.label}
      </label>
      {cloneElement(props.children, { id: inputId })}
    </div>
  );
};
