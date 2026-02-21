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
        "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors",
        checked
          ? "border-zinc-600 bg-zinc-200/15"
          : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        className={classNames(
          "inline-block h-4 w-4 transform rounded-full bg-zinc-100 transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}
