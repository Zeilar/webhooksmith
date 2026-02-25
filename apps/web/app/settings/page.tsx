import { serverFetcher } from "@/api/fetchers/server";
import type { Settings as ISettings } from "@workspace/lib/db/schema";
import { requireUser } from "@/api/server/auth";
import { Settings } from "./settings";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Webhooksmith",
  description: "Configure your account and preferences.",
  alternates: { canonical: "/settings" },
};

export default async function Page() {
  const user = await requireUser();

  const settingsQuery = await serverFetcher<ISettings>("/v1/settings", { headers: { cookie: `${await cookies()}` } });

  if (!settingsQuery.ok || !settingsQuery.data) {
    throw new Error("Settings not found.");
  }

  return <Settings userId={user.id} currentUsername={user.username} currentPerPage={settingsQuery.data.perPage} />;
}
