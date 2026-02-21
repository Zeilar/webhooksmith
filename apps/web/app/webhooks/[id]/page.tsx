import { notFound } from "next/navigation";
import { WebhookBuilder } from "@/app/(components)/webhook-builder";
import { fetcher } from "@/api/fetcher";
import type { Webhook } from "@workspace/lib/db/schema";
import { randomBase58 } from "@workspace/lib/common";
import { cookies } from "next/headers";

export default async function Page({ params }: PageProps<"/webhooks/[id]">) {
  const { data, ok, status } = await fetcher<Webhook>(`/v1/webhooks/${(await params).id}`, {
    headers: { cookie: `${await cookies()}` },
  });

  if (status === 404) {
    notFound();
  }

  if (!ok) {
    throw new Error("Failed to fetch webhook.");
  }

  return (
    <WebhookBuilder
      name={data?.name}
      description={data?.description ?? ""}
      blueprint={data?.blueprint}
      receiver={data?.receiver}
      enabled={data?.enabled ?? true}
      interceptId={randomBase58()}
      createMode={false}
    />
  );
}
