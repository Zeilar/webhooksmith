"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/ui";
import { useParams } from "next/navigation";

interface ErrorPageProps {
  error: Error;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 w-full">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-8">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-700/70 bg-rose-950/30">
              <AlertTriangle className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Something went wrong</h1>
              <p className="mt-1 text-sm text-zinc-300">
                An unexpected error occurred while fetching webhook with id <b>{id}</b>.
              </p>
            </div>
          </div>
          {error.message && (
            <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-zinc-200 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          )}
          <div className="mt-6 flex items-center gap-3">
            <Link href="/webhooks" className={`${buttonVariants({ variant: "outline" })} h-10`}>
              Back to webhooks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
