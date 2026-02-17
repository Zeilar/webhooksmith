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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className={classNames("border-b border-zinc-800 px-4 py-3 flex items-center", headerClassName)}>
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="text-sm font-medium text-zinc-100">{title}</div>
          {headerAction}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
