import { EnabledSegmentedControl } from "@/ui/components";

interface WebhookEnabledSwitchProps {
  enabled: boolean;
}

export function WebhookEnabledSwitch({ enabled }: WebhookEnabledSwitchProps) {
  return <EnabledSegmentedControl enabled={enabled} variant="badge" />;
}
