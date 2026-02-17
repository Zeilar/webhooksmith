import { getUser } from "@/api/server/user";
import { Settings } from "./settings";
import { forbidden } from "next/navigation";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    forbidden();
  }

  return <Settings userId={user.id} currentUsername={user.username} />;
}
