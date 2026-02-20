import { ShieldAlert } from "lucide-react";
import { StatusPage } from "@/app/(components)/status-page";

export default function Page() {
  return (
    <StatusPage
      title="Access forbidden"
      description="You do not have permission to view this page."
      icon={ShieldAlert}
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-amber-700/70 bg-amber-950/30"
      iconClassName="h-5 w-5 text-amber-300"
    />
  );
}
