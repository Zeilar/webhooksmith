import { serverFetcher } from "@/api/fetchers/server";
import type { Settings as ISettings } from "@workspace/lib/db/schema";
import { getUser } from "@/api/server/user";
import { Settings } from "./settings";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    forbidden();
  }

  const settingsQuery = await serverFetcher<ISettings>("/v1/settings", { headers: { cookie: `${await cookies()}` } });

  if (!settingsQuery.ok || !settingsQuery.data) {
    throw new Error("Settings not found.");
  }

  return <Settings userId={user.id} currentUsername={user.username} currentPerPage={settingsQuery.data.perPage} />;
}
