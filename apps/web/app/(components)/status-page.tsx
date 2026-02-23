import Link from "next/link";
import type { Route } from "next";
import type { PropsWithChildren, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { buttonVariants, PageContainer, PageShell } from "@/ui";

interface StatusPageProps {
  title: string;
  description: ReactNode;
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
  backHref?: Route;
  backLabel?: string;
  details?: ReactNode;
}

export function StatusPage({
  title,
  description,
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  backHref = "/",
  backLabel = "Back to webhooks",
  details,
}: StatusPageProps) {
  return (
    <PageShell>
      <PageContainer maxWidthClassName="max-w-3xl" className="flex min-h-[calc(100vh-10rem)] items-center">
        <div className="w-full rounded-2xl border border-slate-700/75 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={iconContainerClassName}>
              <Icon className={iconClassName} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-slate-300">{description}</p>
            </div>
          </div>
          {details}
          <div className="mt-6 flex items-center gap-3">
            <Link href={backHref} className={`${buttonVariants({ variant: "outline" })} h-10`}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}

export function IdBadge({ children }: PropsWithChildren) {
  return (
    <code className="mx-1 rounded border border-slate-500/70 bg-slate-900/70 px-1.5 py-0.5 font-mono text-xs text-slate-100">
      {children}
    </code>
  );
}
