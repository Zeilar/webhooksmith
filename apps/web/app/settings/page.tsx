import { serverFetcher } from "@/api/fetchers/server";
import type { Settings as ISettings } from "@workspace/lib/db/schema";
import { requireUser } from "@/api/server/auth";
import { Settings } from "./settings";
import { cookies } from "next/headers";

export default async function Page() {
  const user = await requireUser();

  const settingsQuery = await serverFetcher<ISettings>("/v1/settings", { headers: { cookie: `${await cookies()}` } });

  if (!settingsQuery.ok || !settingsQuery.data) {
    throw new Error("Settings not found.");
  }

  return <Settings userId={user.id} currentUsername={user.username} currentPerPage={settingsQuery.data.perPage} />;
}
