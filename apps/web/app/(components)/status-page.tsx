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
        <div className="w-full rounded-2xl border-2 border-zinc-800 bg-zinc-950 p-8">
          <div className="flex items-center gap-3">
            <div className={iconContainerClassName}>
              <Icon className={iconClassName} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-zinc-300">{description}</p>
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
    <code className="mx-1 rounded border-2 border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-100">
      {children}
    </code>
  );
}
