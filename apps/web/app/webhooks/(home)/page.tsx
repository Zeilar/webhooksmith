import { fetcher } from "@/api/fetcher";
import { WebhooksPage } from "./webhooks";
import { Webhook } from "@workspace/lib/db/schema";
import { cookies } from "next/headers";

export default async function Page() {
  const { data } = await fetcher<Webhook[]>("/v1/webhooks", { headers: { cookie: `${await cookies()}` } });

  return <WebhooksPage webhooks={data ?? []} />;
}
