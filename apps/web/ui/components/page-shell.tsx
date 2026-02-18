import classNames from "classnames";
import type { PropsWithChildren } from "react";

interface PageShellProps extends PropsWithChildren {
  className?: string;
}

interface PageContainerProps extends PropsWithChildren {
  className?: string;
  maxWidthClassName?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return <main className={classNames("min-h-screen w-full bg-zinc-950 px-25 py-20 text-zinc-100", className)}>{children}</main>;
}

export function PageContainer({ children, className, maxWidthClassName = "max-w-5xl" }: PageContainerProps) {
  return <div className={classNames("mx-auto w-full", maxWidthClassName, className)}>{children}</div>;
}
