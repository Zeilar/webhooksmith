import classNames from "classnames";
import type { ReactNode } from "react";

interface PageTitleProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageTitle({ icon, title, subtitle, action, className }: PageTitleProps) {
  return (
    <div className={classNames("mb-8 flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-fuchsia-400/45 bg-fuchsia-400/20">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
