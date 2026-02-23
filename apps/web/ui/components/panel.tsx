import classNames from "classnames";
import type { ReactNode } from "react";

export function Panel({
  title,
  headerAction,
  children,
  headerClassName,
}: {
  title: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  headerClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/75 bg-slate-950/25 backdrop-blur-sm">
      <div className={classNames("border-b border-slate-700/75 px-4 py-3 flex items-center", headerClassName)}>
        <div className="flex items-center justify-between gap-3 w-full">
          <h2 className="text-lg font-semibold">{title}</h2>
          {headerAction}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
