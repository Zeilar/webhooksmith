"use client";

import type {
  SubmitEvent,
  ReactNode,
  FormHTMLAttributes,
  ComponentProps,
  PropsWithChildren,
  LabelHTMLAttributes,
} from "react";
import MonacoEditor, { type EditorProps as MonacoEditorProps } from "@monaco-editor/react";
import { Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { Button, Required, Switch as UISwitch, type SwitchProps as UISwitchProps } from "@/ui/components";
import { useFieldContext, useFormContext } from "./context";
import classNames from "classnames";
import { useDisclosure } from "../useDisclosure";

export type FormProps = FormHTMLAttributes<HTMLFormElement>;

export interface SubmitButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode;
}

export type ResetButtonProps = ComponentProps<typeof Button>;

export interface BaseFieldProps {
  label?: ReactNode;
  required?: boolean;
  helperText?: ReactNode;
  className?: string;
}

export type InputProps = BaseFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onBlur"> & {
    clearValue?: string | number | null | undefined;
    inputClassName?: string;
  };

export type TextAreaProps = BaseFieldProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange" | "onBlur">;

export interface SelectOption {
  label: string;
  value: string;
}

export type SelectProps = BaseFieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue" | "onChange" | "onBlur"> & {
    options: SelectOption[];
    placeholder?: string;
  };

export type EditorProps = BaseFieldProps &
  Pick<MonacoEditorProps, "height" | "language" | "options"> & {
    editorClassName?: string;
  };

export type SwitchProps = BaseFieldProps &
  Omit<UISwitchProps, "checked" | "onCheckedChange"> & {
    switchClassName?: string;
  };

export interface FieldLabelProps extends PropsWithChildren, LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  htmlFor?: string;
}

const fieldClassName =
  "w-full rounded-lg border border-slate-700/75 bg-slate-900/45 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-fuchsia-400/80 active:border-fuchsia-400/80 disabled:border-slate-800/70 disabled:text-slate-500 read-only:border-slate-800/70 read-only:text-slate-400";

const labelClassName = "mb-1.5 block text-sm font-medium text-slate-200";
const monacoThemeName = "webhooksmith-slate";

function getErrorText(errors: unknown): string | undefined {
  if (!Array.isArray(errors) || errors.length === 0) {
    return undefined;
  }
  const firstError = errors.at(0);
  return typeof firstError === "string" ? firstError : String(firstError);
}

export function FieldLabel({ children, required, htmlFor, className, ...props }: FieldLabelProps) {
  return (
    <label className={classNames(labelClassName, className)} htmlFor={htmlFor} {...props}>
      {children}
      {required && <Required />}
    </label>
  );
}

interface FieldHelperTextProps {
  error?: string;
  helperText?: ReactNode;
}

export function FieldHelperText({ error, helperText }: FieldHelperTextProps) {
  return (error || helperText) && <p className="mt-2 text-xs text-red-400">{error ?? helperText}</p>;
}

export function Form({ children, ...props }: FormProps) {
  const form = useFormContext();

  return (
    <form
      onSubmit={(e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      {...props}
    >
      {children}
    </form>
  );
}

export function SubmitButton({ children, icon, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
      {({ isSubmitting }) => (
        <Button type="submit" disabled={isSubmitting || props.disabled} {...props}>
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
          {children ?? "Submit"}
        </Button>
      )}
    </form.Subscribe>
  );
}

export function ResetButton({ disabled, ...props }: ResetButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isPristine}>
      {(isPristine) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={disabled || isPristine}
          {...props}
        >
          Reset
        </Button>
      )}
    </form.Subscribe>
  );
}

export function Input({
  label,
  id,
  helperText,
  clearValue,
  className,
  inputClassName,
  required,
  type,
  ...props
}: InputProps) {
  const { handleBlur, handleChange, state, name } = useFieldContext<string | number | null | undefined>();
  const [isPasswordVisible, password] = useDisclosure();
  const error = getErrorText(state.meta.errors);
  const canClear = clearValue !== undefined && state.value !== clearValue;
  const isPassword = type === "password";
  const inputType = isPassword ? (isPasswordVisible ? "text" : "password") : type;
  const hasActions = canClear || isPassword;
  const rightPaddingClassName = hasActions ? "pr-10" : "pr-3";

  return (
    <div className={className}>
      {label && (
        <FieldLabel required={required} htmlFor={id ?? name}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <input
          value={state.value ?? ""}
          onChange={(e) => handleChange(type === "number" ? e.target.valueAsNumber : e.target.value)}
          onBlur={handleBlur}
          className={classNames(fieldClassName, rightPaddingClassName, inputClassName)}
          id={id ?? name}
          required={required}
          type={inputType}
          {...props}
        />
        {hasActions && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {canClear && (
              <button
                type="button"
                onClick={() => handleChange(clearValue)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={password.toggle}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}
      </div>
      <FieldHelperText error={error} helperText={helperText} />
    </div>
  );
}

export function TextArea({ label, helperText, className, rows = 4, required, ...props }: TextAreaProps) {
  const { handleBlur, handleChange, state } = useFieldContext<string>();
  const error = getErrorText(state.meta.errors);
  const inputId = typeof props.id === "string" ? props.id : undefined;

  return (
    <div className={className}>
      {label && (
        <FieldLabel required={required} htmlFor={inputId}>
          {label}
        </FieldLabel>
      )}
      <textarea
        value={state.value ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        rows={rows}
        className={fieldClassName}
        required={required}
        {...props}
      />
      <FieldHelperText error={error} helperText={helperText} />
    </div>
  );
}

export function Select({ label, helperText, options, placeholder, className, required, ...props }: SelectProps) {
  const { handleBlur, handleChange, state } = useFieldContext<string>();
  const error = getErrorText(state.meta.errors);
  const inputId = typeof props.id === "string" ? props.id : undefined;

  return (
    <div className={className}>
      {label && (
        <FieldLabel required={required} htmlFor={inputId}>
          {label}
        </FieldLabel>
      )}
      <select
        value={state.value ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        className={fieldClassName}
        required={required}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldHelperText error={error} helperText={helperText} />
    </div>
  );
}

export function Switch({ label, helperText, className, switchClassName, required, id, ...props }: SwitchProps) {
  const { handleBlur, handleChange, state, name } = useFieldContext<boolean>();
  const error = getErrorText(state.meta.errors);
  const switchId = id ?? name;
  const checked = Boolean(state.value);

  return (
    <div className={className}>
      {label && (
        <FieldLabel required={required} htmlFor={switchId}>
          {label}
        </FieldLabel>
      )}
      <UISwitch
        {...props}
        id={switchId}
        checked={checked}
        onBlur={handleBlur}
        onCheckedChange={(nextChecked) => handleChange(nextChecked)}
        className={switchClassName}
      />
      <FieldHelperText error={error} helperText={helperText} />
    </div>
  );
}

export function Editor({
  label,
  required,
  helperText,
  className,
  editorClassName,
  height = 250,
  language = "json",
  options,
}: EditorProps) {
  const { handleBlur, handleChange, state } = useFieldContext<string>();
  const error = getErrorText(state.meta.errors);

  return (
    <div className={className}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className={classNames("overflow-hidden rounded-xl border border-slate-700/75", editorClassName)}>
        <MonacoEditor
          value={state.value ?? ""}
          onChange={(value) => handleChange(value ?? "")}
          onMount={(editor, monaco) => {
            monaco.editor.defineTheme(monacoThemeName, {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {
                "editor.background": "#020617",
                "editor.foreground": "#e2e8f0",
                "editorLineNumber.foreground": "#64748b",
                "editorLineNumber.activeForeground": "#cbd5e1",
                "editorCursor.foreground": "#94a3b8",
                "editor.selectionBackground": "#33415580",
                "editor.selectionHighlightBackground": "#47556955",
                "editor.inactiveSelectionBackground": "#33415550",
                "editorIndentGuide.background1": "#33415575",
                "editorIndentGuide.activeBackground1": "#64748b99",
                "editorWhitespace.foreground": "#33415570",
                editorLineHighlightBackground: "#0f172a80",
                "editorGutter.background": "#020617",
              },
            });
            monaco.editor.setTheme(monacoThemeName);
            editor.onDidBlurEditorText(() => handleBlur());
          }}
          height={height}
          language={language}
          theme={monacoThemeName}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            ...options,
          }}
        />
      </div>
      <FieldHelperText error={error} helperText={helperText} />
    </div>
  );
}
