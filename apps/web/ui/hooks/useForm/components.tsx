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
import { Button, Required } from "@/ui/components";
import { useFieldContext, useFormContext } from "./context";
import classNames from "classnames";
import { useDisclosure } from "../useDisclosure";

export type FormProps = FormHTMLAttributes<HTMLFormElement>;

export type SubmitButtonProps = ComponentProps<typeof Button> & {
  icon?: ReactNode;
};

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

export interface FieldLabelProps extends PropsWithChildren, LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  htmlFor?: string;
}

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 disabled:border-zinc-800 disabled:text-zinc-500 read-only:border-zinc-800 read-only:text-zinc-500";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-200";

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

type FieldHelperTextProps = {
  error?: string;
  helperText?: ReactNode;
};

export function FieldHelperText({ error, helperText }: FieldHelperTextProps) {
  if (!error && !helperText) {
    return null;
  }

  return <p className="mt-2 text-xs text-red-400">{error ?? helperText}</p>;
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
  const rightPaddingClassName = hasActions ? "pr-20" : "pr-3";

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
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {canClear && (
              <button
                type="button"
                onClick={() => handleChange(clearValue)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={password.toggle}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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

export function Editor({
  label,
  required,
  helperText,
  className,
  editorClassName,
  height = 350,
  language = "json",
  options,
}: EditorProps) {
  const { handleBlur, handleChange, state } = useFieldContext<string>();
  const error = getErrorText(state.meta.errors);

  return (
    <div className={className}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className={`overflow-hidden rounded-xl border border-zinc-800 ${editorClassName ?? ""}`}>
        <MonacoEditor
          value={state.value ?? ""}
          onChange={(value) => handleChange(value ?? "")}
          onMount={(editor) => {
            editor.onDidBlurEditorText(() => handleBlur());
          }}
          height={height}
          language={language}
          theme="vs-dark"
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
