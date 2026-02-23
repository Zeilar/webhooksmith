"use client";

import { useQuery } from "@tanstack/react-query";
import { LogOut, Settings, Webhook } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import webooksmithIcon from "../public/webhooksmith.png";
import classNames from "classnames";

interface NavbarProps {
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

export function Navbar({ logoutUrl }: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useQuery<string>({
    queryKey: ["href", pathname, `${searchParams}`],
    queryFn: () => window.location.href,
    initialData: "",
  });
  const logoutHref = !isLoading && data ? `${logoutUrl}?returnUrl=${encodeURIComponent(data)}` : undefined;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/75 bg-slate-950/70 text-slate-100 backdrop-blur-xl px-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-50">
          <Image
            blurDataURL={webooksmithIcon.blurDataURL}
            src={webooksmithIcon.src}
            width={34}
            height={34}
            alt="Logo"
          />
          <span>Webhooksmith</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-2 md:gap-4">
            {items.map(({ url, label, icon }) => {
              const isActive = url === pathname;
              return (
                <li key={url}>
                  <Link
                    href={url}
                    className={classNames([
                      "flex items-center gap-2 border-b-2 px-3 py-5 font-medium transition-colors",
                      isActive
                        ? "border-fuchsia-400"
                        : "border-transparent text-slate-300 hover:border-slate-500/75 hover:text-slate-100",
                    ])}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="ml-2 border-l border-slate-700/75 pl-2">
              <a
                href={logoutHref}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/35 hover:text-slate-100"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
