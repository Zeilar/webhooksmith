import { serverFetcher } from "@/api/fetchers/server";
import { WebhooksPage } from "./webhooks";
import type { PaginatedWebhooksDto } from "@workspace/lib/dto";
import type { Settings } from "@workspace/lib/db/schema";
import { requireUser } from "@/api/server/auth";
import type { Metadata } from "next";

const titleBase = "Webhooks | Webhooksmith";
const description = "Manage your webhooks.";

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page.at(0) : params.page;
  const page = Number(pageParam);

  if (isFinite(page) && page > 1) {
    return {
      title: `Webhooks - Page ${page} | Webhooksmith`,
      description,
      alternates: { canonical: `/?page=${page}` },
    };
  }

  return {
    title: titleBase,
    description,
    alternates: { canonical: "/" },
  };
}

export default async function Page({ searchParams }: PageProps<"/">) {
  await requireUser();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page.at(0) : params.page;

  const settingsQuery = await serverFetcher<Settings>("/v1/settings");
  if (!settingsQuery.ok || !settingsQuery.data) {
    throw new Error("Settings not found.", { cause: settingsQuery });
  }

  const webhooksQueryParams = new URLSearchParams({
    page: `${pageParam ?? 1}`,
    perPage: `${settingsQuery.data.perPage}`,
  });
  const webhooksQuery = await serverFetcher<PaginatedWebhooksDto>(`/v1/webhooks?${webhooksQueryParams}`);
  if (!webhooksQuery.ok || !webhooksQuery.data) {
    throw new Error("Failed to retrieve webhooks.", { cause: webhooksQuery });
  }

  return (
    <WebhooksPage
      webhooks={webhooksQuery.data.items}
      page={webhooksQuery.data.page}
      total={webhooksQuery.data.total}
      totalPages={webhooksQuery.data.totalPages}
    />
  );
}
