import { CircleX } from "lucide-react";
import { StatusPage } from "@/app/(components)/status-page";

export default function Page() {
  return (
    <StatusPage
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved."
      icon={CircleX}
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-700/70 bg-rose-950/30"
      iconClassName="h-5 w-5 text-rose-300"
    />
  );
}
