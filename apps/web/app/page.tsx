import { fetcher } from "@/api/fetcher";
import { WebhooksPage } from "./webhooks/(home)/webhooks";
import type { PaginatedWebhooksDto } from "@workspace/lib/dto";
import type { Setting } from "@workspace/lib/db/schema";
import { cookies } from "next/headers";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const cookieHeader = { cookie: `${await cookies()}` };
  const { data: settings } = await fetcher<Setting>("/v1/settings", { headers: cookieHeader });
  const defaultPageSize = settings?.perPage && settings.perPage > 0 ? settings.perPage : 12;
  const parsedPage = Number.parseInt(params.page ?? "", 10);
  const parsedPageSize = Number.parseInt(params.pageSize ?? "", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : defaultPageSize;
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const { data } = await fetcher<PaginatedWebhooksDto>(`/v1/webhooks?${query.toString()}`, {
    headers: cookieHeader,
  });

  return (
    <WebhooksPage
      webhooks={data?.items ?? []}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      total={data?.total ?? 0}
      totalPages={data?.totalPages ?? 1}
    />
  );
}
