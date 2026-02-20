"use client";

import { useQuery } from "@tanstack/react-query";
import { LogOut, Settings, Webhook } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

interface SidebarProps {
  logoutUrl: string;
}

const items: { url: Route; label: string; icon: ReactNode }[] = [
  {
    url: "/",
    label: "Webhooks",
    icon: <Webhook className="h-5 w-5" />,
  },
  {
    url: "/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ logoutUrl }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useQuery<string>({
    queryKey: ["href", pathname, `${searchParams}`],
    queryFn: () => window.location.href,
    initialData: "",
  });
  const logoutHref = !isLoading && data ? `${logoutUrl}?returnUrl=${encodeURIComponent(data)}` : undefined;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-65 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 md:flex">
        <div className="flex h-33 items-center px-5 pb-8 pt-15">
          <div className="text-lg font-semibold text-zinc-50">Webhooksmith</div>
        </div>
        <nav className="flex-1 px-3 pb-2">
          <ul className="space-y-2">
            {items.map(({ url, label, icon }) => {
              const isActive = url === pathname;
              return (
                <li key={url}>
                  <Link
                    href={url}
                    className={[
                      "flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-base",
                      "transition-colors",
                      isActive ? "bg-zinc-100 text-zinc-950" : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",
                    ].join(" ")}
                  >
                    {icon}
                    <span className="font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-zinc-800 p-4">
          <a
            href={logoutHref}
            className="flex w-full items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-left text-base text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </a>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 px-4 py-2 backdrop-blur md:hidden">
        <ul className="flex items-center justify-around">
          {items.map(({ url, label, icon }) => {
            const isActive = url === pathname;
            return (
              <li key={url}>
                <Link
                  href={url}
                  className={[
                    "flex min-w-20 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                    isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  {icon}
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href={logoutHref}
              className="flex min-w-20 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
