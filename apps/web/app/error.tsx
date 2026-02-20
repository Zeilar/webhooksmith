"use client";

import { AlertTriangle } from "lucide-react";
import { StatusPage } from "@/app/(components)/status-page";

interface GlobalErrorPageProps {
  error: Error;
}

export default function GlobalErrorPage({ error }: GlobalErrorPageProps) {
  return (
    <StatusPage
      title="Unexpected error"
      description="Something went wrong while loading this page."
      icon={AlertTriangle}
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-700/70 bg-rose-950/30"
      iconClassName="h-5 w-5 text-rose-300"
      details={
        error.message ? (
          <pre className="mt-4 overflow-x-auto rounded-lg border-2 border-zinc-800 bg-zinc-950/70 p-3 text-zinc-200 whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        ) : undefined
      }
    />
  );
}
