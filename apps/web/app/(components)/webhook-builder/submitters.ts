import { toast } from "sonner";
import type { CreateWebhookDto, UpdateWebhookDto } from "@workspace/lib/dto";
import { fetcher } from "@/api/fetcher";
import type { Webhook } from "@workspace/lib/db/schema";

export async function createOnSubmit(dto: CreateWebhookDto, onSuccess: (id: string) => void): Promise<void> {
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

export async function updateOnSubmit(id: string, dto: UpdateWebhookDto, onSuccess?: VoidFunction): Promise<void> {
  if (!id) {
    toast.error("An unexpected error occurred");
    return;
  }
  const { ok } = await fetcher(`/v1/webhooks/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  if (!ok) {
    toast.error("Update failed");
    return;
  }
  toast.success("Webhook updated");
  onSuccess?.();
}
