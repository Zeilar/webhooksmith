import classNames from "classnames";

interface EnabledSegmentedControlBaseProps {
  enabled: boolean;
  className?: string;
}

interface EnabledSegmentedControlToggleProps extends EnabledSegmentedControlBaseProps {
  variant?: "toggle";
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

interface EnabledSegmentedControlBadgeProps extends EnabledSegmentedControlBaseProps {
  variant: "badge";
  disabled?: never;
  onChange?: never;
}

export type EnabledSegmentedControlProps = EnabledSegmentedControlToggleProps | EnabledSegmentedControlBadgeProps;

function getSegmentClassName(active: boolean, tone: "enabled" | "disabled", interactive: boolean): string {
  return classNames(
    "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    interactive && !active && "hover:bg-slate-800/65",
    tone === "enabled"
      ? active
        ? "border-emerald-500/45 bg-emerald-500/20 text-emerald-200"
        : "border-transparent text-slate-300"
      : active
        ? "border-rose-500/45 bg-rose-500/20 text-rose-200"
        : "border-transparent text-slate-300",
  );
}

export function EnabledSegmentedControl(props: EnabledSegmentedControlProps) {
  const { enabled, className } = props;
  const isToggle = props.variant !== "badge";

  if (!isToggle) {
    return (
      <span
        className={classNames(
          "inline-flex select-none items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
          enabled
            ? "border-emerald-500/45 bg-emerald-500/20 text-emerald-200"
            : "border-rose-500/45 bg-rose-500/20 text-rose-200",
          className,
        )}
        aria-label={`Webhook is ${enabled ? "enabled" : "disabled"}`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>
    );
  }

  return (
    <div
      className={classNames(
        "inline-flex items-center gap-1 rounded-md border border-slate-700/75 bg-slate-900/45 p-1",
        className,
      )}
      role="group"
      aria-label="Webhook status"
    >
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => props.onChange(true)}
        className={getSegmentClassName(enabled, "enabled", true)}
        aria-pressed={enabled}
      >
        Enabled
      </button>
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => props.onChange(false)}
        className={getSegmentClassName(!enabled, "disabled", true)}
        aria-pressed={!enabled}
      >
        Disabled
      </button>
    </div>
  );
}
