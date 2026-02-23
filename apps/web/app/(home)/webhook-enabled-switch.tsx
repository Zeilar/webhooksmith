"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/ui/components";
import { useFetcher } from "@/api/fetchers/client";

interface WebhookEnabledSwitchProps {
  webhookId: string;
  initialEnabled: boolean;
}

export function WebhookEnabledSwitch({ webhookId, initialEnabled }: WebhookEnabledSwitchProps) {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();
  const queryKey = ["webhook-enabled", webhookId] as const;
  const { data: enabled = initialEnabled, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, ok } = await fetcher<{ enabled?: boolean }>(`/v1/webhooks/${webhookId}`);
      if (!ok) {
        throw new Error("Failed to fetch webhook status");
      }
      return Boolean(data?.enabled);
    },
    initialData: initialEnabled,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationKey: ["webhook-enabled", webhookId],
    mutationFn: async (nextEnabled: boolean) => {
      const { ok } = await fetcher(`/v1/webhooks/${webhookId}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      if (!ok) {
        throw new Error("Failed to update webhook status");
      }
    },
    onMutate: async (nextEnabled) => {
      const previousEnabled = queryClient.getQueryData<boolean>(queryKey) ?? initialEnabled;
      queryClient.setQueryData(queryKey, nextEnabled);
      return { previousEnabled };
    },
    onError: (_error, _nextEnabled, context) => {
      queryClient.setQueryData(queryKey, context?.previousEnabled ?? initialEnabled);
      toast.error("Failed to update webhook status");
    },
  });

  const onToggle = async (nextEnabled: boolean) => {
    if (mutation.isPending) {
      return;
    }
    await mutation.mutateAsync(nextEnabled);
  };

  return <Switch checked={enabled} disabled={isLoading || mutation.isPending} onCheckedChange={onToggle} />;
}
