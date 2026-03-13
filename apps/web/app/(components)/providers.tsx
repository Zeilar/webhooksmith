"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { ApiUrlProvider, SocketProvider, UserProvider } from "@/ui";
import { ProgressProvider } from "@bprogress/next/app";
import type { UserWithoutPassword } from "@workspace/lib/db/schema";

interface ProvidersProps extends PropsWithChildren {
  apiUrl: string;
  user: UserWithoutPassword | null;
  socketUrl: string;
}

export function Providers({ apiUrl, user, children, socketUrl }: ProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false }, mutations: { retry: false } },
  });

  return (
    <ProgressProvider height="4px" color="var(--color-fuchsia-400)" options={{ showSpinner: false }} shallowRouting>
      <QueryClientProvider client={queryClient}>
        <ApiUrlProvider apiUrl={apiUrl}>
          <UserProvider user={user}>
            <SocketProvider socketUrl={socketUrl}>
              <Toaster
                position="top-right"
                toastOptions={{
                  classNames: {
                    toast:
                      "rounded-xl border border-slate-500/75 bg-slate-900/90 text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur-md select-none",
                    title: "text-sm font-medium text-slate-100",
                    description: "text-xs text-slate-300",
                    actionButton: "!border !border-fuchsia-400/55 !bg-fuchsia-500 !text-white hover:!bg-fuchsia-400",
                    cancelButton: "!border !border-slate-500/70 !bg-slate-800 !text-slate-100 hover:!bg-slate-700",
                    success: "!border-emerald-400/60 !bg-emerald-500/18 !text-emerald-100",
                    error: "!border-rose-400/60 !bg-rose-500/18 !text-rose-100",
                    warning: "!border-amber-400/60 !bg-amber-500/18 !text-amber-100",
                    info: "!border-sky-400/60 !bg-sky-500/18 !text-sky-100",
                  },
                }}
              />
              {children}
            </SocketProvider>
          </UserProvider>
        </ApiUrlProvider>
      </QueryClientProvider>
    </ProgressProvider>
  );
}
