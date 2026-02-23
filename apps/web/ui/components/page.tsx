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
  return (
    <main
      className={classNames(
        "h-full w-full bg-transparent px-4 text-slate-100 sm:px-6 lg:px-10 lg:py-6 xl:px-16",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageContainer({ children, className, maxWidthClassName = "max-w-5xl" }: PageContainerProps) {
  return <div className={classNames("mx-auto w-full", maxWidthClassName, className)}>{children}</div>;
}
