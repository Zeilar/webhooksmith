import { toast } from "sonner";
import type { CreateWebhookDto, UpdateWebhookDto } from "@workspace/lib/dto";
import type { FetcherFn } from "@/api/fetchers/fetcher";
import type { Webhook } from "@workspace/lib/db/schema";

export async function createOnSubmit(
  fetcher: FetcherFn,
  dto: CreateWebhookDto,
  onSuccess: (id: string) => void,
): Promise<void> {
  const { data, ok } = await fetcher<Webhook>("/v1/webhooks", {
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
  fetcher: FetcherFn,
  id: string,
  dto: UpdateWebhookDto,
  onSuccess?: VoidFunction,
): Promise<void> {
  const { ok } = await fetcher(`/v1/webhooks/${id}`, {
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
