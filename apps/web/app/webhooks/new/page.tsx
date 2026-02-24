import { WebhookBuilder } from "@/app/(components)/webhook-builder";
import { requireUser } from "@/api/server/auth";
import { randomBase58 } from "@workspace/lib/common";

export default async function Page() {
  await requireUser();
  return <WebhookBuilder interceptId={randomBase58()} createMode />;
}
