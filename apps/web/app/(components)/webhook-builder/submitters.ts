import { toast } from "sonner";
import type { CreateWebhookDto, UpdateWebhookDto } from "@workspace/lib/dto";
import type { Webhook } from "@workspace/lib/db/schema";
import type { ClientFetcher } from "@/api/fetchers/client";

export async function createOnSubmit(
  fetcher: ClientFetcher,
  dto: CreateWebhookDto,
  onSuccess: (id: string) => void,
): Promise<void> {
  const { data, ok } = await fetcher<Webhook>("/webhooks", {
    method: "POST",
    body: JSON.stringify(dto),
  });
  if (!ok) {
    toast.error("Failed to create webhook");
    return;
  }
  if (!data?.id) {
    toast.error("An unexpected error occurred");
    return;
  }
  toast.success("Webhook created");
  onSuccess(data.id);
}

export async function updateOnSubmit(
  fetcher: ClientFetcher,
  id: string,
  dto: UpdateWebhookDto,
  onSuccess?: VoidFunction,
): Promise<void> {
  const { ok } = await fetcher(`/webhooks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  if (!ok) {
    toast.error("Update failed");
    return;
  }
  toast.success("Webhook updated");
  onSuccess?.();
}
