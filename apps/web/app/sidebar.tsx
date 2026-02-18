"use client";

import { useQuery } from "@tanstack/react-query";
import { LogOut, Settings, Webhook } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const { data, isLoading } = useQuery<string>({
    queryKey: ["href"],
    queryFn: () => window.location.href,
    initialData: "",
  });

  return (
    <aside className="sticky top-0 flex h-screen w-70 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex h-16 items-center px-5">
        <div className="text-lg font-semibold text-zinc-50">Webhooksmith</div>
      </div>
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-2">
          {items.map(({ url, label, icon }) => {
            const isActive =
              url === "/" ? pathname === "/" || pathname.startsWith("/webhooks") : pathname.startsWith(url);
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
          href={data || isLoading ? `${logoutUrl}?returnUrl=${encodeURIComponent(data)}` : undefined}
          className="flex w-full items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-left text-base text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </a>
      </div>
    </aside>
  );
}
