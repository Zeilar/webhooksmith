import { serverFetcher } from "@/api/fetchers/server";
import { WebhooksPage } from "./webhooks";
import type { PaginatedWebhooksDto } from "@workspace/lib/dto";
import type { Settings } from "@workspace/lib/db/schema";
import { requireUser } from "@/api/server/auth";

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
