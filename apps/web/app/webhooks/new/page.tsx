import { WebhookBuilder } from "@/app/(components)/webhook-builder";
import { requireUser } from "@/api/server/auth";
import { randomBase58 } from "@workspace/lib/common";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Webhook | Webhooksmith",
  description: "Create a webhook.",
  alternates: { canonical: "/webhooks/new" },
};

export default async function Page() {
  await requireUser();
  return <WebhookBuilder interceptId={randomBase58()} createMode />;
}
