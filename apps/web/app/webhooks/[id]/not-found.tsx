"use client";

import { CircleX } from "lucide-react";
import { buttonVariants } from "@/ui";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 w-full">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-8">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-700/70 bg-rose-950/30">
              <CircleX className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Webhook not found</h1>
              <p className="mt-1 text-sm text-zinc-300">
                No webhook exists for this ID. It may have been deleted or the URL is invalid.
              </p>
            </div>
          </div>
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
