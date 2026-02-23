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
      iconContainerClassName="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-700/70 bg-rose-950/30"
      iconClassName="h-5 w-5 text-rose-300"
      details={
        error.message ? (
          <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-500/70 bg-slate-900/75 p-3 text-slate-200 whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        ) : undefined
      }
    />
  );
}
