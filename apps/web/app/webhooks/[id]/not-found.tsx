"use client";

import { CircleX } from "lucide-react";
import { useParams } from "next/navigation";
import { IdBadge, StatusPage } from "@/app/(components)/status-page";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <StatusPage
      title="Webhook not found"
      description={
        <>
          No webhook exists with id <IdBadge>{id}</IdBadge>. It may have been deleted or the URL is invalid.
        </>
      }
      icon={CircleX}
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-700/70 bg-rose-950/30"
      iconClassName="h-5 w-5 text-rose-300"
    />
  );
}
