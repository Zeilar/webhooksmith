"use client";

import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { IdBadge, StatusPage } from "@/app/(components)/status-page";

interface ErrorPageProps {
  error: Error;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const { id } = useParams<{ id: string }>();
  return (
    <StatusPage
      title="Something went wrong"
      description={
        <>
          An unexpected error occurred while fetching webhook with id <IdBadge>{id}</IdBadge>.
        </>
      }
      icon={AlertTriangle}
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-700/70 bg-rose-950/30"
      iconClassName="h-5 w-5 text-rose-300"
      details={
        error.message && (
          <pre className="mt-4 overflow-x-auto rounded-lg border-2 border-zinc-800 bg-zinc-950/70 p-3 text-zinc-200 whitespace-pre-wrap wrap-break-word">
            {error.message}
          </pre>
        )
      }
    />
  );
}
