import { fetcher } from "@/api/fetcher";
import type { Setting } from "@workspace/lib/db/schema";
import { getUser } from "@/api/server/user";
import { Settings } from "./settings";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    forbidden();
  }

  const { data: settings } = await fetcher<Setting>("/v1/settings", { headers: { cookie: `${await cookies()}` } });

  return <Settings userId={user.id} currentUsername={user.username} currentPerPage={settings?.perPage ?? 12} />;
}
