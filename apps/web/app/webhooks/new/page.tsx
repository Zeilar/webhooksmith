import { WebhookBuilder } from "@/app/(components)/webhook-builder";
import { randomBase58 } from "@workspace/lib/common";

export default function Page() {
  return <WebhookBuilder interceptId={randomBase58()} createMode />;
}
