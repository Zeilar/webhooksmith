import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Webhook as WebhookIcon } from "lucide-react";
import type { Webhook } from "@workspace/lib/db/schema";
import classNames from "classnames";
import { buttonVariants } from "@/ui/components/button";
import { PageContainer, PageShell, PageTitle } from "@/ui/components";
import { WebhookEnabledSwitch } from "./webhook-enabled-switch";

interface WebhooksPageProps {
  webhooks: Webhook[];
  page: number;
  total: number;
  totalPages: number;
}

export function WebhooksPage({ webhooks, page, total, totalPages }: WebhooksPageProps) {
  let content: ReactNode = null;

  if (webhooks.length === 0 && total === 0) {
    content = (
      <div className="rounded-2xl border border-slate-700/75 bg-slate-950/25 p-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <h2 className="mt-4 text-lg font-semibold">No webhooks yet</h2>
          <p className="mt-2 text-sm text-slate-300/85">
            Create your first webhook to start forging webhook blueprints
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <Link href="/webhooks/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" />
              New webhook
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (webhooks.length === 0) {
    content = (
      <div className="rounded-2xl border border-slate-700/75 bg-slate-950/25 p-10 text-center backdrop-blur-sm">
        <h2 className="text-lg font-semibold">No webhooks on this page</h2>
        <p className="mt-2 text-sm text-slate-300/85">Try going back to a previous page.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {webhooks.map(({ id, name, description, enabled }) => (
          <div
            key={id}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/75 bg-slate-950/25 p-4"
          >
            <div className="relative flex items-start justify-between gap-4 h-full">
              <div className="h-full flex flex-col items-start">
                <h6 className="truncate text-md font-semibold">{name}</h6>
                <div className="mb-4">
                  {description ? (
                    <div className="line-clamp-3 text-sm text-slate-300/85">{description}</div>
                  ) : (
                    <div className="text-sm text-slate-300/85">No description</div>
                  )}
                </div>
                <Link href={`/webhooks/${id}`} className={buttonVariants({ variant: "outline", className: "mt-auto" })}>
                  Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="shrink-0">
                <WebhookEnabledSwitch webhookId={id} initialEnabled={enabled ?? true} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <PageShell>
      <PageContainer>
        <PageTitle
          icon={<WebhookIcon className="h-5 w-5" />}
          title="Webhooks"
          action={
            <Link href="/webhooks/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" />
              New webhook
            </Link>
          }
        />
        <div className="mt-8">{content}</div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300/85">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-3">
            {page > 1 ? (
              <Link href={`/?page=${page - 1}`} className={buttonVariants({ variant: "outline" })}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span
                className={classNames(
                  buttonVariants({ variant: "outline" }),
                  "pointer-events-none opacity-50 select-none",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}
            {page < totalPages ? (
              <Link href={`/?page=${page + 1}`} className={buttonVariants({ variant: "outline" })}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className={classNames(
                  buttonVariants({ variant: "outline" }),
                  "pointer-events-none opacity-50 select-none",
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
