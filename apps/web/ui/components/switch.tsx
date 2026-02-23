import classNames from "classnames";

export interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
}

export function Switch({ checked, disabled, id, className, onCheckedChange, onBlur }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onBlur={onBlur}
      onClick={() => onCheckedChange?.(!checked)}
      className={classNames(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
        checked ? "border-fuchsia-400 bg-fuchsia-400/50" : "border-slate-700/75 bg-slate-900/65 hover:border-slate-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        className={classNames(
          "inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}
