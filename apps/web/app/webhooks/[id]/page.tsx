import { notFound } from "next/navigation";
import { WebhookBuilder } from "@/app/(components)/webhook-builder";
import { serverFetcher } from "@/api/fetchers/server";
import type { Webhook } from "@workspace/lib/db/schema";
import { randomBase58 } from "@workspace/lib/common";
import { requireUser } from "@/api/server/auth";

export default async function Page({ params }: PageProps<"/webhooks/[id]">) {
  await requireUser();

  const { data, ok, status } = await serverFetcher<Webhook>(`/v1/webhooks/${(await params).id}`);

  if (status === 404) {
    notFound();
  }

  if (!ok || !data) {
    throw new Error("Failed to fetch webhook.");
  }

  return (
    <WebhookBuilder
      name={data.name}
      description={data.description ?? ""}
      blueprint={data.blueprint}
      receiver={data.receiver}
      enabled={data.enabled}
      interceptId={randomBase58()}
      createMode={false}
    />
  );
}
