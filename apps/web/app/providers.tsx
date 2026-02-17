"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { SocketProvider, type CurrentUser, UserProvider } from "@/ui";
import { ProgressProvider } from "@bprogress/next/app";

interface ProvidersProps extends PropsWithChildren {
  user: CurrentUser | null;
}

export function Providers({ user, children }: ProvidersProps) {
  return (
    <ProgressProvider height="4px" color="white" options={{ showSpinner: false }} shallowRouting>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false }, mutations: { retry: false } },
          })
        }
      >
        <UserProvider user={user}>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast:
                    "rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-lg shadow-black/40 backdrop-blur-md select-none",
                  title: "text-sm font-medium text-zinc-100",
                  description: "text-xs text-zinc-300",
                  actionButton: "!bg-zinc-100 !text-zinc-900 hover:!bg-zinc-200",
                  cancelButton: "!bg-zinc-800 !text-zinc-200 hover:!bg-zinc-700",
                  success: "!border-emerald-700/70 !bg-emerald-950/40 !text-emerald-100",
                  error: "!border-rose-700/70 !bg-rose-950/40 !text-rose-100",
                  warning: "!border-amber-700/70 !bg-amber-950/40 !text-amber-100",
                  info: "!border-sky-700/70 !bg-sky-950/40 !text-sky-100",
                },
              }}
            />
            {children}
          </SocketProvider>
        </UserProvider>
      </QueryClientProvider>
    </ProgressProvider>
  );
}
