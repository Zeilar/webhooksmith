import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Webhook as WebhookIcon } from "lucide-react";
import type { Webhook } from "@workspace/lib/db/schema";
import classNames from "classnames";
import { buttonVariants } from "@/ui/components/button";
import { PageContainer, PageShell, PageTitle } from "@/ui/components";

interface WebhooksPageProps {
  webhooks: Webhook[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function WebhooksPage({ webhooks, page, pageSize, total, totalPages }: WebhooksPageProps) {
  let content: ReactNode = null;

  if (webhooks.length === 0 && total === 0) {
    content = (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <WebhookIcon className="h-6 w-6 text-zinc-200" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No webhooks yet</h2>
          <p className="mt-2 text-sm text-zinc-400">Create your first webhook to start forging webhook blueprints</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/webhooks/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              Create webhook
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (webhooks.length === 0) {
    content = (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
        <h2 className="text-lg font-semibold">No webhooks on this page</h2>
        <p className="mt-2 text-sm text-zinc-400">Try going back to a previous page.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {webhooks.map(({ id, name, description }) => (
          <Link
            key={id}
            href={`/webhooks/${id}`}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors duration-150 hover:bg-zinc-900/60"
          >
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="truncate text-md font-semibold text-zinc-100">{name}</div>
                {description && <div className="line-clamp-3 text-sm text-zinc-400">{description}</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <PageShell>
      <PageContainer>
        <PageTitle
          icon={<WebhookIcon className="h-5 w-5 text-zinc-200" />}
          title="Webhooks"
          action={
            <Link
              href="/webhooks/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              New webhook
            </Link>
          }
        />
        <div className="mt-8">{content}</div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-3">
            {page > 1 ? (
              <Link href={`/?page=${page - 1}&pageSize=${pageSize}`} className={buttonVariants({ variant: "outline" })}>
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
              <Link href={`/?page=${page + 1}&pageSize=${pageSize}`} className={buttonVariants({ variant: "outline" })}>
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
